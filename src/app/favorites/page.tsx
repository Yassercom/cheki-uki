'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getRecipeBySlug } from '@/lib/api';
import { Recipe } from '@/types/recipe';
import RecipeCard from '@/components/RecipeCard';

export default function FavoritesPage() {
  const { favorites } = useApp();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadFavoriteRecipes = async () => {
      setLoading(true);
      try {
        const recipes = await Promise.all(
          favorites.map(async (id) => {
            // Since we store IDs, we need to find recipes by ID
            // For now, we'll use a simple approach - in a real app, you'd have a proper API endpoint
            const mockRecipes = await import('../../../data/recipes.json');
            return mockRecipes.default.find((recipe: any) => recipe.id === id);
          })
        );
        
        setFavoriteRecipes(recipes.filter(Boolean) as Recipe[]);
      } catch (error) {
        console.error('Error loading favorite recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteRecipes();
  }, [favorites]);

  const filteredRecipes = favoriteRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary-500 fill-current" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-dark-slate mb-4">
            Your Favourite Recipes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {favorites.length === 0 
              ? "You haven't saved any recipes yet. Start exploring and add your favourites!"
              : `You've saved ${favorites.length} delicious recipe${favorites.length !== 1 ? 's' : ''} to cook later.`
            }
          </p>
        </div>

        {favorites.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-soft-grey rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-dark-slate mb-4">
              No favourites yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Browse our collection of delicious recipes and click the heart icon 
              to save your favourites for easy access later.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/recipes"
                className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Browse Recipes
              </a>
              <a
                href="/recipes?tags=quick"
                className="px-6 py-3 bg-white text-primary-500 border border-primary-500 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Quick Meals
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search your favourites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-soft-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: favorites.length }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-soft-grey p-4 animate-pulse">
                    <div className="aspect-[4/3] bg-soft-grey rounded-lg mb-4"></div>
                    <div className="h-4 bg-soft-grey rounded mb-2"></div>
                    <div className="h-3 bg-soft-grey rounded w-3/4 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-soft-grey rounded w-1/4"></div>
                      <div className="h-3 bg-soft-grey rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRecipes.length > 0 ? (
              /* Recipes Grid */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>

                {/* Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-soft-grey p-6">
                  <h3 className="text-lg font-semibold text-dark-slate mb-4">Your Cooking Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-cream rounded-lg">
                      <div className="text-2xl font-bold text-primary-500">{favorites.length}</div>
                      <div className="text-sm text-gray-600">Saved Recipes</div>
                    </div>
                    <div className="text-center p-4 bg-cream rounded-lg">
                      <div className="text-2xl font-bold text-fresh-500">
                        {favoriteRecipes.filter(r => r.tags.includes('quick')).length}
                      </div>
                      <div className="text-sm text-gray-600">Quick Meals</div>
                    </div>
                    <div className="text-center p-4 bg-cream rounded-lg">
                      <div className="text-2xl font-bold text-accent-500">
                        {favoriteRecipes.filter(r => r.tags.includes('vegetarian')).length}
                      </div>
                      <div className="text-sm text-gray-600">Vegetarian</div>
                    </div>
                    <div className="text-center p-4 bg-cream rounded-lg">
                      <div className="text-2xl font-bold text-primary-500">
                        {favoriteRecipes.filter(r => r.cuisine === 'British').length}
                      </div>
                      <div className="text-sm text-gray-600">British Classics</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* No Search Results */
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark-slate mb-2">No recipes found</h3>
                <p className="text-gray-600 mb-6">
                  No favourite recipes match your search for "{searchQuery}".
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </>
        )}

        {/* Tips Section */}
        {favorites.length > 0 && (
          <div className="mt-16 bg-dark-slate text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Cooking Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Meal Planning</h4>
                <p className="text-gray-300 text-sm">
                  Use your favourites to plan your weekly meals. Mix quick recipes for busy days 
                  with more elaborate ones for weekends.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Grocery Shopping</h4>
                <p className="text-gray-300 text-sm">
                  Export grocery lists from your favourite recipes to make shopping more efficient 
                  and reduce food waste.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
