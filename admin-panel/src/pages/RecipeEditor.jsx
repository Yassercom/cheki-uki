import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ImageUploader from '../components/ImageUploader'

const RecipeEditor = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(slug)

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [recipe, setRecipe] = useState({
    title: '',
    slug: '',
    description: '',
    cuisine: 'British',
    difficulty: 'Easy',
    prep_time_mins: 15,
    cook_time_mins: 30,
    base_servings: 4,
    image_url: '',
    image_alt: '',
    author_name: 'Chef',
    is_published: false,
    is_featured: false
  })
  const [ingredients, setIngredients] = useState([
    { ingredient_name: '', quantity: '', unit: '', notes: '', sort_order: 0 }
  ])
  const [steps, setSteps] = useState([
    { step_number: 1, instruction: '', image_url: '', image_alt: '' }
  ])
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  useEffect(() => {
    loadTags()
    if (isEditing) {
      loadRecipe()
    }
  }, [slug])

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) throw error
      setTags(data || [])
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const loadRecipe = async () => {
    try {
      setLoading(true)
      
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients(*),
          recipe_steps(*),
          recipe_tags(tag_id)
        `)
        .eq('slug', slug)
        .single()

      if (recipeError) throw recipeError

      setRecipe(recipeData)
      setIngredients(recipeData.recipe_ingredients.sort((a, b) => a.sort_order - b.sort_order) || [])
      setSteps(recipeData.recipe_steps.sort((a, b) => a.step_number - b.step_number) || [])
      setSelectedTags(recipeData.recipe_tags.map(rt => rt.tag_id) || [])
    } catch (error) {
      console.error('Error loading recipe:', error)
      alert('Error loading recipe. Please try again.')
      navigate('/recipes')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleRecipeChange = (field, value) => {
    setRecipe(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'title' && !isEditing ? { slug: generateSlug(value) } : {})
    }))
  }

  const addIngredient = () => {
    setIngredients(prev => [
      ...prev,
      { ingredient_name: '', quantity: '', unit: '', notes: '', sort_order: prev.length }
    ])
  }

  const updateIngredient = (index, field, value) => {
    setIngredients(prev => prev.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    ))
  }

  const removeIngredient = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index))
  }

  const addStep = () => {
    setSteps(prev => [
      ...prev,
      { step_number: prev.length + 1, instruction: '', image_url: '', image_alt: '' }
    ])
  }

  const updateStep = (index, field, value) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    ))
  }

  const removeStep = (index) => {
    setSteps(prev => prev.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      step_number: i + 1
    })))
  }

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const validateForm = () => {
    if (!recipe.title.trim()) {
      alert('Please enter a recipe title')
      return false
    }
    if (!recipe.description.trim()) {
      alert('Please enter a recipe description')
      return false
    }
    if (ingredients.filter(ing => ing.ingredient_name.trim()).length === 0) {
      alert('Please add at least one ingredient')
      return false
    }
    if (steps.filter(step => step.instruction.trim()).length === 0) {
      alert('Please add at least one cooking step')
      return false
    }
    return true
  }

  const saveRecipe = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      let recipeData = { ...recipe }
      
      // Clean up ingredients and steps
      const validIngredients = ingredients
        .filter(ing => ing.ingredient_name.trim())
        .map((ing, index) => ({ ...ing, sort_order: index }))
      
      const validSteps = steps
        .filter(step => step.instruction.trim())
        .map((step, index) => ({ ...step, step_number: index + 1 }))

      if (isEditing) {
        // Update existing recipe
        const { error: recipeError } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', recipe.id)

        if (recipeError) throw recipeError

        // Delete existing ingredients and steps
        await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipe.id)
        await supabase.from('recipe_steps').delete().eq('recipe_id', recipe.id)
        await supabase.from('recipe_tags').delete().eq('recipe_id', recipe.id)

        // Log audit
        await supabase.from('admin_audit').insert({
          action: 'update',
          recipe_id: recipe.id,
          meta: { title: recipe.title }
        })
      } else {
        // Create new recipe
        const { data: newRecipe, error: recipeError } = await supabase
          .from('recipes')
          .insert(recipeData)
          .select()
          .single()

        if (recipeError) throw recipeError
        recipeData = newRecipe

        // Log audit
        await supabase.from('admin_audit').insert({
          action: 'create',
          recipe_id: newRecipe.id,
          meta: { title: recipe.title }
        })
      }

      // Insert ingredients
      if (validIngredients.length > 0) {
        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(validIngredients.map(ing => ({ ...ing, recipe_id: recipeData.id })))

        if (ingredientsError) throw ingredientsError
      }

      // Insert steps
      if (validSteps.length > 0) {
        const { error: stepsError } = await supabase
          .from('recipe_steps')
          .insert(validSteps.map(step => ({ ...step, recipe_id: recipeData.id })))

        if (stepsError) throw stepsError
      }

      // Insert tags
      if (selectedTags.length > 0) {
        const { error: tagsError } = await supabase
          .from('recipe_tags')
          .insert(selectedTags.map(tagId => ({ recipe_id: recipeData.id, tag_id: tagId })))

        if (tagsError) throw tagsError
      }

      alert(isEditing ? 'Recipe updated successfully!' : 'Recipe created successfully!')
      navigate('/recipes')
    } catch (error) {
      console.error('Error saving recipe:', error)
      alert('Error saving recipe. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const steps_nav = [
    { id: 1, name: 'Basic Info', icon: '📝' },
    { id: 2, name: 'Ingredients', icon: '🥕' },
    { id: 3, name: 'Instructions', icon: '👨‍🍳' },
    { id: 4, name: 'Images & Tags', icon: '📸' }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing ? `Editing: ${recipe.title}` : 'Add a new recipe to your collection'}
          </p>
        </div>
        <button
          onClick={() => navigate('/recipes')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Recipes
        </button>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <nav className="flex space-x-4">
            {steps_nav.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentStep === step.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{step.icon}</span>
                {step.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipe Title</label>
                  <input
                    type="text"
                    value={recipe.title}
                    onChange={(e) => handleRecipeChange('title', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Classic Fish and Chips"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
                  <input
                    type="text"
                    value={recipe.slug}
                    onChange={(e) => handleRecipeChange('slug', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="classic-fish-and-chips"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={recipe.description}
                    onChange={(e) => handleRecipeChange('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="A brief description of your recipe..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cuisine</label>
                  <select
                    value={recipe.cuisine}
                    onChange={(e) => handleRecipeChange('cuisine', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="British">British</option>
                    <option value="Indian">Indian</option>
                    <option value="Italian">Italian</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="French">French</option>
                    <option value="American">American</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                  <select
                    value={recipe.difficulty}
                    onChange={(e) => handleRecipeChange('difficulty', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Prep Time (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={recipe.prep_time_mins}
                    onChange={(e) => handleRecipeChange('prep_time_mins', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cook Time (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={recipe.cook_time_mins}
                    onChange={(e) => handleRecipeChange('cook_time_mins', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Servings</label>
                  <input
                    type="number"
                    min="1"
                    value={recipe.base_servings}
                    onChange={(e) => handleRecipeChange('base_servings', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Author Name</label>
                  <input
                    type="text"
                    value={recipe.author_name}
                    onChange={(e) => handleRecipeChange('author_name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Chef Name"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={recipe.is_published}
                    onChange={(e) => handleRecipeChange('is_published', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Published</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={recipe.is_featured}
                    onChange={(e) => handleRecipeChange('is_featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
                <button
                  onClick={addIngredient}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  + Add Ingredient
                </button>
              </div>

              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={ingredient.ingredient_name}
                        onChange={(e) => updateIngredient(index, 'ingredient_name', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Amount"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Unit"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Notes"
                        value={ingredient.notes}
                        onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Cooking Instructions</h3>
                <button
                  onClick={addStep}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  + Add Step
                </button>
              </div>

              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Step {index + 1}</h4>
                      <button
                        onClick={() => removeStep(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Step
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Describe this cooking step..."
                      value={step.instruction}
                      onChange={(e) => updateStep(index, 'instruction', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Images & Tags</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Recipe Image</label>
                <ImageUploader
                  currentImageUrl={recipe.image_url}
                  onImageUploaded={(url, alt) => {
                    handleRecipeChange('image_url', url)
                    handleRecipeChange('image_alt', alt)
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text</label>
                <input
                  type="text"
                  value={recipe.image_alt}
                  onChange={(e) => handleRecipeChange('image_alt', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe the image for accessibility"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation and Save */}
      <div className="flex items-center justify-between bg-white shadow rounded-lg px-4 py-3">
        <div className="flex space-x-3">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Previous
            </button>
          )}
          {currentStep < 4 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next →
            </button>
          )}
        </div>

        <button
          onClick={saveRecipe}
          disabled={saving}
          className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Recipe' : 'Create Recipe'}
        </button>
      </div>
    </div>
  )
}

export default RecipeEditor
