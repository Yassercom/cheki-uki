'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUpDown, Grid, List } from 'lucide-react';
import { getRecipes } from '@/lib/api';
import { Recipe, RecipeFilters as IRecipeFilters, RecipeSort } from '@/types/recipe';
import RecipeCard from '@/components/RecipeCard';
import RecipeFiltersComponent from '@/components/RecipeFilters';
import { cn, debounce } from '@/lib/utils';

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  // Initialize filters from URL params
  const [filters, setFilters] = useState<IRecipeFilters>(() => {
    const initialFilters: IRecipeFilters = {};
    
    const search = searchParams.get('search');
    if (search) initialFilters.search = search;
    
    const cuisine = searchParams.get('cuisine');
    if (cuisine) initialFilters.cuisine = cuisine.split(',');
    
    const tags = searchParams.get('tags');
    if (tags) initialFilters.tags = tags.split(',');
    
    const difficulty = searchParams.get('difficulty');
    if (difficulty) initialFilters.difficulty = difficulty.split(',') as ('Easy' | 'Medium' | 'Hard')[];
    
    const maxPrepTime = searchParams.get('maxPrepTime');
    if (maxPrepTime) initialFilters.maxPrepTime = parseInt(maxPrepTime);
    
    return initialFilters;
  });

  const [sort, setSort] = useState<RecipeSort>({
    field: 'title',
    direction: 'asc'
  });

  // Debounced search function
  const debouncedSearch = debounce(async (searchFilters: IRecipeFilters, searchSort: RecipeSort, page: number) => {
    setLoading(true);
    try {
      const offset = (page - 1) * recipesPerPage;
      const result = await getRecipes(searchFilters, searchSort, recipesPerPage, offset);
      setRecipes(result.recipes);
      setTotalRecipes(result.total);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Fetch recipes when filters, sort, or page changes
  useEffect(() => {
    debouncedSearch(filters, sort, currentPage);
  }, [filters, sort, currentPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.cuisine?.length) params.set('cuisine', filters.cuisine.join(','));
    if (filters.tags?.length) params.set('tags', filters.tags.join(','));
    if (filters.difficulty?.length) params.set('difficulty', filters.difficulty.join(','));
    if (filters.maxPrepTime) params.set('maxPrepTime', filters.maxPrepTime.toString());
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  const handleFiltersChange = (newFilters: IRecipeFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (field: RecipeSort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRecipes / recipesPerPage);

  const getSortLabel = (field: RecipeSort['field']) => {
    const labels = {
      title: 'Name',
      totalTimeMins: 'Time',
      datePublished: 'Date',
      difficulty: 'Difficulty'
    };
    return labels[field];
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-dark-slate mb-4">
            All Recipes
          </h1>
          <p className="text-lg text-gray-600">
            Discover {totalRecipes} delicious recipes from Britain and beyond
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <RecipeFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              className="sticky top-24"
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-white rounded-lg border border-soft-grey">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {loading ? 'Loading...' : `${totalRecipes} recipe${totalRecipes !== 1 ? 's' : ''} found`}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort Controls */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <div className="flex space-x-1">
                    {(['title', 'totalTimeMins', 'datePublished', 'difficulty'] as const).map((field) => (
                      <button
                        key={field}
                        onClick={() => handleSortChange(field)}
                        className={cn(
                          'px-3 py-1 text-sm rounded-lg transition-colors flex items-center space-x-1',
                          sort.field === field
                            ? 'bg-primary-500 text-white'
                            : 'bg-soft-grey text-dark-slate hover:bg-primary-100'
                        )}
                      >
                        <span>{getSortLabel(field)}</span>
                        {sort.field === field && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 bg-soft-grey rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                    )}
                    aria-label="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                    )}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recipes Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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
            ) : recipes.length > 0 ? (
              <>
                <div className={cn(
                  'grid gap-6 mb-8',
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                )}>
                  {recipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe}
                      className={viewMode === 'list' ? 'md:flex md:items-center' : ''}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm border border-soft-grey rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-soft-grey transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              'px-3 py-2 text-sm rounded-lg transition-colors',
                              currentPage === page
                                ? 'bg-primary-500 text-white'
                                : 'border border-soft-grey hover:bg-soft-grey'
                            )}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm border border-soft-grey rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-soft-grey transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-dark-slate mb-2">No recipes found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find more recipes.
                </p>
                <button
                  onClick={() => handleFiltersChange({})}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
