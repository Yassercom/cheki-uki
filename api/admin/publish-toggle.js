// ============================================================================
// Admin Publish Toggle API - Vercel Serverless Function
// POST /api/admin/publish-toggle
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Check if user has admin or moderator privileges
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, is_moderator')
      .eq('id', user.id)
      .single();

    if (profileError || (!profile?.is_admin && !profile?.is_moderator)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    // Extract request parameters
    const { recipeId, recipeIds, published } = req.body;

    // Handle single recipe or bulk operation
    const targetRecipeIds = recipeIds || (recipeId ? [recipeId] : []);

    if (targetRecipeIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing recipe ID(s)'
      });
    }

    if (published === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing published status'
      });
    }

    // Validate that all recipes exist
    const { data: existingRecipes, error: fetchError } = await supabase
      .from('recipes')
      .select('id, title, slug, is_published')
      .in('id', targetRecipeIds);

    if (fetchError) {
      console.error('Recipe fetch error:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch recipes'
      });
    }

    if (existingRecipes.length !== targetRecipeIds.length) {
      return res.status(404).json({
        success: false,
        error: 'One or more recipes not found'
      });
    }

    // Update publish status
    const { data: updatedRecipes, error: updateError } = await supabase
      .from('recipes')
      .update({ 
        is_published: published,
        updated_at: new Date().toISOString()
      })
      .in('id', targetRecipeIds)
      .select('id, title, slug, is_published');

    if (updateError) {
      console.error('Recipe publish update error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update recipe publish status'
      });
    }

    // Log audit entries for each recipe
    const auditEntries = existingRecipes.map(recipe => ({
      user_id: user.id,
      action: published ? 'publish' : 'unpublish',
      recipe_id: recipe.id,
      meta: {
        title: recipe.title,
        slug: recipe.slug,
        previous_status: recipe.is_published,
        new_status: published,
        bulk_operation: targetRecipeIds.length > 1
      }
    }));

    await supabase
      .from('admin_audit')
      .insert(auditEntries);

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        message: `${targetRecipeIds.length} recipe(s) ${published ? 'published' : 'unpublished'} successfully`,
        updated_recipes: updatedRecipes,
        count: targetRecipeIds.length
      }
    });

  } catch (error) {
    console.error('Publish toggle API error:', error);
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
