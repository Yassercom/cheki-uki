// ============================================================================
// Admin Delete Recipe API - Vercel Serverless Function
// DELETE /api/admin/delete-recipe
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
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

    // Check if user has admin privileges (only admins can delete)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can delete recipes'
      });
    }

    // Extract recipe ID from request body or query
    const recipeId = req.body?.recipeId || req.query?.recipeId;

    if (!recipeId) {
      return res.status(400).json({
        success: false,
        error: 'Missing recipe ID'
      });
    }

    // Check if recipe exists and get details for audit log
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('id, title, slug, image_url')
      .eq('id', recipeId)
      .single();

    if (fetchError || !existingRecipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found'
      });
    }

    // Delete associated images from storage if they exist
    if (existingRecipe.image_url && existingRecipe.image_url.includes('recipe-images')) {
      try {
        // Extract file path from URL
        const urlParts = existingRecipe.image_url.split('/recipe-images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage
            .from('recipe-images')
            .remove([filePath]);
        }
      } catch (storageError) {
        console.warn('Failed to delete recipe image from storage:', storageError);
        // Continue with recipe deletion even if image deletion fails
      }
    }

    // Delete recipe (CASCADE will handle related records)
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId);

    if (deleteError) {
      console.error('Recipe deletion error:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete recipe'
      });
    }

    // Log audit entry
    await supabase
      .from('admin_audit')
      .insert({
        user_id: user.id,
        action: 'delete',
        recipe_id: null, // Recipe no longer exists
        meta: {
          deleted_recipe_id: recipeId,
          title: existingRecipe.title,
          slug: existingRecipe.slug
        }
      });

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        message: 'Recipe deleted successfully',
        deleted_recipe: {
          id: recipeId,
          title: existingRecipe.title,
          slug: existingRecipe.slug
        }
      }
    });

  } catch (error) {
    console.error('Delete recipe API error:', error);
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
