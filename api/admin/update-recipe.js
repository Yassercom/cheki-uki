// ============================================================================
// Admin Update Recipe API - Vercel Serverless Function
// PUT /api/admin/update-recipe
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
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

    // Extract recipe data from request body
    const { recipeId, recipe, ingredients = [], steps = [], tags = [] } = req.body;

    if (!recipeId || !recipe) {
      return res.status(400).json({
        success: false,
        error: 'Missing recipe ID or recipe data'
      });
    }

    // Check if recipe exists
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('id, title, slug')
      .eq('id', recipeId)
      .single();

    if (fetchError || !existingRecipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found'
      });
    }

    // If slug is being changed, check for conflicts
    if (recipe.slug && recipe.slug !== existingRecipe.slug) {
      const { data: slugConflict } = await supabase
        .from('recipes')
        .select('id')
        .eq('slug', recipe.slug)
        .neq('id', recipeId)
        .single();

      if (slugConflict) {
        return res.status(409).json({
          success: false,
          error: 'Recipe with this slug already exists'
        });
      }
    }

    // Update recipe
    const recipeData = {
      ...recipe,
      updated_at: new Date().toISOString()
    };

    const { data: updatedRecipe, error: updateError } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', recipeId)
      .select()
      .single();

    if (updateError) {
      console.error('Recipe update error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update recipe'
      });
    }

    // Delete existing ingredients, steps, and tags
    await Promise.all([
      supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId),
      supabase.from('recipe_steps').delete().eq('recipe_id', recipeId),
      supabase.from('recipe_tags').delete().eq('recipe_id', recipeId)
    ]);

    // Insert new ingredients if provided
    if (ingredients.length > 0) {
      const ingredientsData = ingredients
        .filter(ing => ing.ingredient_name && ing.ingredient_name.trim())
        .map((ing, index) => ({
          recipe_id: recipeId,
          ingredient_name: ing.ingredient_name,
          quantity: ing.quantity || null,
          unit: ing.unit || null,
          notes: ing.notes || null,
          sort_order: ing.sort_order !== undefined ? ing.sort_order : index
        }));

      if (ingredientsData.length > 0) {
        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsData);

        if (ingredientsError) {
          console.error('Ingredients update error:', ingredientsError);
          return res.status(500).json({
            success: false,
            error: 'Failed to update recipe ingredients'
          });
        }
      }
    }

    // Insert new steps if provided
    if (steps.length > 0) {
      const stepsData = steps
        .filter(step => step.instruction && step.instruction.trim())
        .map((step, index) => ({
          recipe_id: recipeId,
          step_number: step.step_number !== undefined ? step.step_number : index + 1,
          instruction: step.instruction,
          image_url: step.image_url || null,
          image_alt: step.image_alt || null
        }));

      if (stepsData.length > 0) {
        const { error: stepsError } = await supabase
          .from('recipe_steps')
          .insert(stepsData);

        if (stepsError) {
          console.error('Steps update error:', stepsError);
          return res.status(500).json({
            success: false,
            error: 'Failed to update recipe steps'
          });
        }
      }
    }

    // Insert new tags if provided
    if (tags.length > 0) {
      const tagsData = tags.map(tagId => ({
        recipe_id: recipeId,
        tag_id: tagId
      }));

      const { error: tagsError } = await supabase
        .from('recipe_tags')
        .insert(tagsData);

      if (tagsError) {
        console.error('Tags update error:', tagsError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update recipe tags'
        });
      }
    }

    // Log audit entry
    await supabase
      .from('admin_audit')
      .insert({
        user_id: user.id,
        action: 'update',
        recipe_id: recipeId,
        meta: {
          title: recipe.title || existingRecipe.title,
          slug: recipe.slug || existingRecipe.slug,
          ingredients_count: ingredients.length,
          steps_count: steps.length,
          tags_count: tags.length,
          previous_title: existingRecipe.title
        }
      });

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        recipe: updatedRecipe,
        message: 'Recipe updated successfully'
      }
    });

  } catch (error) {
    console.error('Update recipe API error:', error);
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
      sizeLimit: '10mb',
    },
  },
};
