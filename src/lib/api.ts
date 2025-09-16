import { Recipe, RecipeFilters, RecipeSort } from '@/types/recipe';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || !API_BASE_URL;

// Mock data import for development
let mockRecipes: Recipe[] = [];

if (USE_MOCK_DATA) {
  // Dynamic import for mock data
  import('../../data/recipes.json').then((data) => {
    mockRecipes = data.default as Recipe[];
  }).catch(() => {
    console.warn('Could not load mock recipes data');
  });
}

/**
 * Get all recipes with optional filtering and sorting
 */
export async function getRecipes(
  filters?: RecipeFilters,
  sort?: RecipeSort,
  limit?: number,
  offset?: number
): Promise<{ recipes: Recipe[]; total: number }> {
  if (USE_MOCK_DATA) {
    return getMockRecipes(filters, sort, limit, offset);
  }

  try {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.cuisine?.length) params.append('cuisine', filters.cuisine.join(','));
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters?.maxPrepTime) params.append('maxPrepTime', filters.maxPrepTime.toString());
    if (filters?.difficulty?.length) params.append('difficulty', filters.difficulty.join(','));
    
    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }
    
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response = await fetch(`${API_BASE_URL}/api/recipes?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipes:', error);
    // Fallback to mock data on error
    return getMockRecipes(filters, sort, limit, offset);
  }
}

/**
 * Get a single recipe by slug
 */
export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  if (USE_MOCK_DATA) {
    return getMockRecipeBySlug(slug);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${slug}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe:', error);
    // Fallback to mock data on error
    return getMockRecipeBySlug(slug);
  }
}

/**
 * Get featured recipes for homepage
 */
export async function getFeaturedRecipes(limit: number = 6): Promise<Recipe[]> {
  if (USE_MOCK_DATA) {
    return getMockFeaturedRecipes(limit);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/recipes/featured?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching featured recipes:', error);
    // Fallback to mock data on error
    return getMockFeaturedRecipes(limit);
  }
}

/**
 * Search recipes with instant search functionality
 */
export async function searchRecipes(query: string, limit: number = 10): Promise<Recipe[]> {
  if (USE_MOCK_DATA) {
    return getMockSearchResults(query, limit);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/recipes/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching recipes:', error);
    // Fallback to mock data on error
    return getMockSearchResults(query, limit);
  }
}

// Mock data functions for development
async function getMockRecipes(
  filters?: RecipeFilters,
  sort?: RecipeSort,
  limit?: number,
  offset?: number
): Promise<{ recipes: Recipe[]; total: number }> {
  // Ensure mock data is loaded
  if (mockRecipes.length === 0) {
    try {
      const data = await import('../../data/recipes.json');
      mockRecipes = data.default as Recipe[];
    } catch (error) {
      console.error('Error loading mock data:', error);
      return { recipes: [], total: 0 };
    }
  }

  let filteredRecipes = [...mockRecipes];

  // Apply filters
  if (filters) {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.cuisine?.length) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        filters.cuisine!.includes(recipe.cuisine)
      );
    }

    if (filters.tags?.length) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        filters.tags!.some(tag => recipe.tags.includes(tag))
      );
    }

    if (filters.maxPrepTime) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.prepTimeMins <= filters.maxPrepTime!
      );
    }

    if (filters.difficulty?.length) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        filters.difficulty!.includes(recipe.difficulty)
      );
    }
  }

  // Apply sorting
  if (sort) {
    filteredRecipes.sort((a, b) => {
      let aValue = a[sort.field];
      let bValue = b[sort.field];

      if (sort.field === 'datePublished') {
        // Convert DD/MM/YYYY to Date for comparison
        aValue = new Date(aValue?.split('/').reverse().join('-') || '');
        bValue = new Date(bValue?.split('/').reverse().join('-') || '');
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const total = filteredRecipes.length;
  
  // Apply pagination
  if (offset || limit) {
    const start = offset || 0;
    const end = limit ? start + limit : undefined;
    filteredRecipes = filteredRecipes.slice(start, end);
  }

  return { recipes: filteredRecipes, total };
}

async function getMockRecipeBySlug(slug: string): Promise<Recipe | null> {
  // Ensure mock data is loaded
  if (mockRecipes.length === 0) {
    try {
      const data = await import('../../data/recipes.json');
      mockRecipes = data.default as Recipe[];
    } catch (error) {
      console.error('Error loading mock data:', error);
      return null;
    }
  }

  return mockRecipes.find(recipe => recipe.slug === slug) || null;
}

async function getMockFeaturedRecipes(limit: number): Promise<Recipe[]> {
  const { recipes } = await getMockRecipes();
  return recipes.slice(0, limit);
}

async function getMockSearchResults(query: string, limit: number): Promise<Recipe[]> {
  const { recipes } = await getMockRecipes({ search: query }, undefined, limit);
  return recipes;
}
