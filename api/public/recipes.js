// ============================================================================
// Public Recipes API - Vercel Serverless Function
// GET /api/public/recipes
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key (read-only access)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Extract query parameters
    const {
      q: searchQuery,
      tag: tagFilter,
      cuisine: cuisineFilter,
      difficulty: difficultyFilter,
      limit = '20',
      page = '1',
      featured = 'false'
    } = req.query;

    // Parse and validate pagination parameters
    const limitNum = Math.min(parseInt(limit) || 20, 100); // Max 100 items per page
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const offset = (pageNum - 1) * limitNum;

    // Build the query using the stored function for better performance
    let query = supabase.rpc('get_published_recipes', {
      search_query: searchQuery || null,
      tag_filter: tagFilter || null,
      cuisine_filter: cuisineFilter || null,
      difficulty_filter: difficultyFilter || null,
      limit_count: limitNum,
      offset_count: offset
    });

    // Execute the query
    const { data: recipes, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch recipes'
      });
    }

    // Get total count for pagination (separate query)
    let countQuery = supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true);

    // Apply the same filters for count
    if (searchQuery) {
      countQuery = countQuery.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (cuisineFilter) {
      countQuery = countQuery.eq('cuisine', cuisineFilter);
    }
    if (difficultyFilter) {
      countQuery = countQuery.eq('difficulty', difficultyFilter);
    }
    if (tagFilter) {
      countQuery = countQuery.in('id', 
        supabase
          .from('recipe_tags')
          .select('recipe_id')
          .in('tag_id', 
            supabase
              .from('tags')
              .select('id')
              .eq('slug', tagFilter)
          )
      );
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
      // Continue without count if this fails
    }

    // Filter by featured if requested
    let filteredRecipes = recipes || [];
    if (featured === 'true') {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.is_featured);
    }

    // Calculate pagination metadata
    const totalPages = totalCount ? Math.ceil(totalCount / limitNum) : 1;
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Set cache headers for better performance
    // Cache for 5 minutes for published content
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/json');

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        recipes: filteredRecipes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount || filteredRecipes.length,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search: searchQuery || null,
          tag: tagFilter || null,
          cuisine: cuisineFilter || null,
          difficulty: difficultyFilter || null,
          featured: featured === 'true'
        }
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Export config for Vercel
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
