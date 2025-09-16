'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Clock, Users, Heart, Printer, Share2, ChefHat, Timer, Check, Plus, Minus } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { useApp } from '@/contexts/AppContext';
import { formatCookingTime, getDifficultyColor, convertUnits, scaleIngredientQuantity, cn } from '@/lib/utils';
import RecipeCard from './RecipeCard';

interface RecipeDetailPageProps {
  recipe: Recipe;
  relatedRecipes: Recipe[];
}

export default function RecipeDetailPage({ recipe, relatedRecipes }: RecipeDetailPageProps) {
  const { unitSystem, isFavorite, addToFavorites, removeFromFavorites } = useApp();
  const [servings, setServings] = useState(recipe.baseServings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isRecipeFavorite = isFavorite(recipe.id);

  const handleFavoriteClick = () => {
    if (isRecipeFavorite) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe.id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Recipe link copied to clipboard!');
    }
  };

  const toggleIngredientCheck = (ingredientId: string) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  };

  const toggleStepCheck = (stepId: string) => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const adjustServings = (delta: number) => {
    const newServings = Math.max(1, servings + delta);
    setServings(newServings);
  };

  const exportGroceryList = () => {
    const groceryList = recipe.ingredients.map(ingredient => {
      const scaledQuantity = scaleIngredientQuantity(ingredient.quantity, recipe.baseServings, servings);
      const converted = convertUnits(scaledQuantity, ingredient.unit, unitSystem);
      return `${converted.value} ${converted.unit} ${ingredient.name}${ingredient.note ? ` (${ingredient.note})` : ''}`;
    }).join('\n');

    const blob = new Blob([`Grocery List for ${recipe.title}\n\n${groceryList}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.slug}-grocery-list.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (cookingMode) {
    return (
      <div className="min-h-screen bg-dark-slate text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Cooking Mode Header */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setCookingMode(false)}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              Exit Cooking Mode
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{recipe.title}</h1>
              <p className="text-white/80">Step {currentStep + 1} of {recipe.steps.length}</p>
            </div>
            <div className="w-24"></div>
          </div>

          {/* Current Step */}
          <div className="bg-white/10 rounded-xl p-8 mb-8">
            <div className="text-4xl font-bold mb-4">Step {currentStep + 1}</div>
            <p className="text-xl leading-relaxed mb-6">
              {recipe.steps[currentStep].text}
            </p>
            {recipe.steps[currentStep].durationMins && (
              <div className="flex items-center space-x-2 text-accent-400">
                <Timer className="w-5 h-5" />
                <span>Timer: {recipe.steps[currentStep].durationMins} minutes</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
            >
              Previous Step
            </button>
            
            <div className="flex space-x-2">
              {recipe.steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    'w-3 h-3 rounded-full transition-colors',
                    index === currentStep ? 'bg-primary-500' : 'bg-white/30'
                  )}
                />
              ))}
            </div>
            
            <button
              onClick={() => setCurrentStep(prev => Math.min(recipe.steps.length - 1, prev + 1))}
              disabled={currentStep === recipe.steps.length - 1}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream" itemScope itemType="https://schema.org/Recipe">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px]">
        <Image
          src={recipe.imageUrl}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
          itemProp="image"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Recipe Header */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium text-white",
                getDifficultyColor(recipe.difficulty)
              )}>
                {recipe.difficulty}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white" itemProp="recipeCuisine">
                {recipe.cuisine}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight" itemProp="name">
              {recipe.title}
            </h1>
            
            <p className="text-lg text-white/90 mb-6 max-w-3xl leading-relaxed" itemProp="description">
              {recipe.description}
            </p>

            {/* Recipe Meta */}
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>
                  <time itemProp="totalTime" dateTime={`PT${recipe.totalTimeMins}M`}>
                    {formatCookingTime(recipe.totalTimeMins)}
                  </time>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span itemProp="recipeYield">{recipe.baseServings} servings</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5" />
                <span>
                  Prep: <time itemProp="prepTime" dateTime={`PT${recipe.prepTimeMins}M`}>
                    {formatCookingTime(recipe.prepTimeMins)}
                  </time>
                </span>
              </div>
            </div>

            {/* Hidden Schema.org metadata */}
            <div className="sr-only">
              <span itemProp="author" itemScope itemType="https://schema.org/Person">
                <span itemProp="name">{recipe.author?.name || "UK Food Recipes"}</span>
              </span>
              <time itemProp="datePublished" dateTime={recipe.datePublished ? new Date(recipe.datePublished.split('/').reverse().join('-')).toISOString() : ''}>
                {recipe.datePublished}
              </time>
              <time itemProp="cookTime" dateTime={`PT${recipe.cookTimeMins}M`}>
                {recipe.cookTimeMins} minutes
              </time>
              <span itemProp="recipeCategory">{recipe.cuisine}</span>
              <span itemProp="keywords">{recipe.tags.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleFavoriteClick}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors',
              isRecipeFavorite
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-600 border-soft-grey hover:bg-primary-50'
            )}
            aria-label={isRecipeFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('w-5 h-5', isRecipeFavorite && 'fill-current')} />
            <span>{isRecipeFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-soft-grey bg-white text-gray-600 hover:bg-soft-grey transition-colors"
            aria-label="Share recipe"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-soft-grey bg-white text-gray-600 hover:bg-soft-grey transition-colors print:hidden"
            aria-label="Print recipe"
          >
            <Printer className="w-5 h-5" />
            <span>Print</span>
          </button>
          <button
            onClick={() => setCookingMode(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-accent-400 text-white hover:bg-accent-500 transition-colors"
          >
            <ChefHat className="w-5 h-5" />
            <span>Cooking Mode</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recipe Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recipe Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-cream rounded-lg">
            <div className="text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-primary-500" />
              <div className="text-sm text-gray-600">Prep Time</div>
              <div className="font-semibold">{formatCookingTime(recipe.prepTimeMins)}</div>
            </div>
            <div className="text-center">
              <Timer className="w-6 h-6 mx-auto mb-2 text-accent-400" />
              <div className="text-sm text-gray-600">Cook Time</div>
              <div className="font-semibold">{formatCookingTime(recipe.cookTimeMins)}</div>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-fresh-500" />
              <div className="text-sm text-gray-600">Servings</div>
              <div className="font-semibold">{servings}</div>
            </div>
            <div className="text-center">
              <ChefHat className="w-6 h-6 mx-auto mb-2 text-gray-500" />
              <div className="text-sm text-gray-600">Difficulty</div>
              <div className="font-semibold">{recipe.difficulty}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-soft-grey p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark-slate">Ingredients</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="servings" className="text-sm font-medium text-gray-700">
                      Servings:
                    </label>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => adjustServings(-1)}
                        className="p-1 rounded-lg border border-soft-grey hover:bg-soft-grey transition-colors"
                        aria-label="Decrease servings"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 bg-cream rounded-lg font-medium min-w-[3rem] text-center">
                        {servings}
                      </span>
                      <button
                        onClick={() => adjustServings(1)}
                        className="p-1 rounded-lg border border-soft-grey hover:bg-soft-grey transition-colors"
                        aria-label="Increase servings"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {recipe.ingredients.map((ingredient) => {
                  const scaledQuantity = scaleIngredientQuantity(ingredient.quantity, recipe.baseServings, servings);
                  const converted = convertUnits(scaledQuantity, ingredient.unit, unitSystem);
                  const isChecked = checkedIngredients.has(ingredient.id);

                  return (
                    <li key={ingredient.id} className="flex items-start space-x-3" itemProp="recipeIngredient">
                      <button
                        onClick={() => toggleIngredientCheck(ingredient.id)}
                        className={cn(
                          'mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                          isChecked
                            ? 'bg-fresh-500 border-fresh-500 text-white'
                            : 'border-gray-300 hover:border-fresh-500'
                        )}
                        aria-label={`Mark ${ingredient.name} as ${isChecked ? 'unchecked' : 'checked'}`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </button>
                      <span className={cn('flex-1', isChecked && 'line-through text-gray-500')}>
                        <strong>{converted.value} {converted.unit}</strong> {ingredient.name}
                        {ingredient.note && <em className="text-gray-600"> ({ingredient.note})</em>}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={exportGroceryList}
                className="w-full px-4 py-2 bg-accent-400 text-white rounded-lg font-medium hover:bg-accent-500 transition-colors"
              >
                Export Grocery List
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-soft-grey p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark-slate">Instructions</h2>
                <button
                  onClick={() => setCookingMode(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  Cooking Mode
                </button>
              </div>

              <ol className="space-y-6">
                {recipe.steps.map((step, index) => {
                  const isChecked = checkedSteps.has(step.id);
                  
                  return (
                    <li key={step.id} className="flex items-start space-x-4" itemProp="recipeInstructions" itemScope itemType="https://schema.org/HowToStep">
                      <button
                        onClick={() => toggleStepCheck(step.id)}
                        className={cn(
                          'mt-1 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-colors flex-shrink-0',
                          isChecked
                            ? 'bg-fresh-500 border-fresh-500 text-white'
                            : 'border-primary-500 text-primary-500 hover:bg-primary-50'
                        )}
                        aria-label={`Mark step ${index + 1} as ${isChecked ? 'unchecked' : 'checked'}`}
                      >
                        {isChecked ? <Check className="w-4 h-4" /> : index + 1}
                      </button>
                      <div className="flex-1">
                        <p className={cn('text-gray-800 leading-relaxed', isChecked && 'line-through text-gray-500')} itemProp="text">
                          {step.text}
                        </p>
                        {step.durationMins && (
                          <div className="flex items-center space-x-1 mt-2 text-accent-600">
                            <Timer className="w-4 h-4" />
                            <span className="text-sm">{step.durationMins} minutes</span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Nutrition Info */}
            {recipe.nutrition && (
              <div className="bg-white rounded-xl shadow-sm border border-soft-grey p-6 mt-6" itemProp="nutrition" itemScope itemType="https://schema.org/NutritionInformation">
                <h3 className="text-xl font-bold text-dark-slate mb-4">Nutrition Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recipe.nutrition.calories && (
                    <div className="text-center p-3 bg-cream rounded-lg">
                      <div className="text-2xl font-bold text-primary-500" itemProp="calories">{recipe.nutrition.calories}</div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                  )}
                  {recipe.nutrition.protein && (
                    <div className="text-center p-3 bg-cream rounded-lg">
                      <div className="text-2xl font-bold text-fresh-500" itemProp="proteinContent">{recipe.nutrition.protein}g</div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                  )}
                  {recipe.nutrition.carbs && (
                    <div className="text-center p-3 bg-cream rounded-lg">
                      <div className="text-2xl font-bold text-accent-500" itemProp="carbohydrateContent">{recipe.nutrition.carbs}g</div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                  )}
                  {recipe.nutrition.fat && (
                    <div className="text-center p-3 bg-cream rounded-lg">
                      <div className="text-2xl font-bold text-gray-500" itemProp="fatContent">{recipe.nutrition.fat}g</div>
                      <div className="text-sm text-gray-600">Fat</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Recipes */}
        {relatedRecipes.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-dark-slate mb-8 text-center">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedRecipes.map((relatedRecipe) => (
                <RecipeCard key={relatedRecipe.id} recipe={relatedRecipe} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </div>
  );
}
