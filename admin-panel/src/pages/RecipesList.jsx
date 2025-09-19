import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const RecipesList = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, published, draft
  const [selectedRecipes, setSelectedRecipes] = useState([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  
  const { hasAdminOnlyAccess } = useAuth()

  useEffect(() => {
    loadRecipes()
  }, [searchQuery, statusFilter])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('recipes')
        .select(`
          id,
          title,
          slug,
          cuisine,
          difficulty,
          is_published,
          is_featured,
          created_at,
          updated_at,
          author_name
        `)
        .order('created_at', { ascending: false })

      // Apply status filter
      if (statusFilter === 'published') {
        query = query.eq('is_published', true)
      } else if (statusFilter === 'draft') {
        query = query.eq('is_published', false)
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error

      setRecipes(data || [])
    } catch (error) {
      console.error('Error loading recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRecipe = (recipeId) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedRecipes.length === recipes.length) {
      setSelectedRecipes([])
    } else {
      setSelectedRecipes(recipes.map(r => r.id))
    }
  }

  const handleBulkPublish = async (publish = true) => {
    if (selectedRecipes.length === 0) return

    setBulkActionLoading(true)
    try {
      const { error } = await supabase
        .from('recipes')
        .update({ is_published: publish })
        .in('id', selectedRecipes)

      if (error) throw error

      // Log audit entries
      for (const recipeId of selectedRecipes) {
        await supabase
          .from('admin_audit')
          .insert({
            action: publish ? 'publish' : 'unpublish',
            recipe_id: recipeId,
            meta: { bulk_action: true }
          })
      }

      await loadRecipes()
      setSelectedRecipes([])
    } catch (error) {
      console.error('Error in bulk action:', error)
      alert('Error updating recipes. Please try again.')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleDeleteRecipe = async (recipeId) => {
    if (!hasAdminOnlyAccess()) {
      alert('Only administrators can delete recipes.')
      return
    }

    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)

      if (error) throw error

      await loadRecipes()
    } catch (error) {
      console.error('Error deleting recipe:', error)
      alert('Error deleting recipe. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (recipe) => {
    if (recipe.is_published) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Published
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Draft
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recipes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your recipe collection
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/recipes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Recipe
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <label htmlFor="search" className="sr-only">Search recipes</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Recipes</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedRecipes.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-lg p-4">
              <span className="text-sm text-blue-700">
                {selectedRecipes.length} recipe{selectedRecipes.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkPublish(true)}
                  disabled={bulkActionLoading}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkPublish(false)}
                  disabled={bulkActionLoading}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  Unpublish
                </button>
                <button
                  onClick={() => setSelectedRecipes([])}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipes Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recipes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating a new recipe.'}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <Link
                  to="/recipes/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Recipe
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedRecipes.length === recipes.length && recipes.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuisine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedRecipes.includes(recipe.id)}
                        onChange={() => handleSelectRecipe(recipe.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {recipe.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            by {recipe.author_name}
                          </div>
                        </div>
                        {recipe.is_featured && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(recipe)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recipe.cuisine}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(recipe.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/recipes/${recipe.slug}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        {hasAdminOnlyAccess() && (
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipesList
