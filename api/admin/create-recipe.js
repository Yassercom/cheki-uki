// ============================================================================
// Admin Create Recipe API - Vercel Serverless Function
// POST /api/admin/create-recipe
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

    // Extract recipe data from request body
    const { recipe, ingredients = [], steps = [], tags = [] } = req.body;

    if (!recipe) {
      return res.status(400).json({
        success: false,
        error: 'Missing recipe data'
      });
    }

    // Validate required recipe fields
    const requiredFields = ['title', 'slug', 'description', 'cuisine', 'difficulty', 'prep_time_mins', 'cook_time_mins', 'base_servings'];
    const missingFields = requiredFields.filter(field => !recipe[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if slug already exists
    const { data: existingRecipe } = await supabase
      .from('recipes')
      .select('id')
      .eq('slug', recipe.slug)
      .single();

    if (existingRecipe) {
      return res.status(409).json({
        success: false,
        error: 'Recipe with this slug already exists'
      });
    }

    // Start transaction by creating the recipe
    const recipeData = {
      ...recipe,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newRecipe, error: recipeError } = await supabase
      .from('recipes')
      .insert(recipeData)
      .select()
      .single();

    if (recipeError) {
      console.error('Recipe creation error:', recipeError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create recipe'
      });
    }

    // Insert ingredients if provided
    if (ingredients.length > 0) {
      const ingredientsData = ingredients.map((ing, index) => ({
        recipe_id: newRecipe.id,
        ingredient_name: ing.ingredient_name,
        quantity: ing.quantity || null,
        unit: ing.unit || null,
        notes: ing.notes || null,
        sort_order: ing.sort_order !== undefined ? ing.sort_order : index
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsData);

      if (ingredientsError) {
        console.error('Ingredients creation error:', ingredientsError);
        // Rollback: delete the recipe
        await supabase.from('recipes').delete().eq('id', newRecipe.id);
        return res.status(500).json({
          success: false,
          error: 'Failed to create recipe ingredients'
        });
      }
    }

    // Insert steps if provided
    if (steps.length > 0) {
      const stepsData = steps.map((step, index) => ({
        recipe_id: newRecipe.id,
        step_number: step.step_number !== undefined ? step.step_number : index + 1,
        instruction: step.instruction,
        image_url: step.image_url || null,
        image_alt: step.image_alt || null
      }));

      const { error: stepsError } = await supabase
        .from('recipe_steps')
        .insert(stepsData);

      if (stepsError) {
        console.error('Steps creation error:', stepsError);
        // Rollback: delete the recipe and ingredients
        await supabase.from('recipes').delete().eq('id', newRecipe.id);
        return res.status(500).json({
          success: false,
          error: 'Failed to create recipe steps'
        });
      }
    }

    // Insert tags if provided
    if (tags.length > 0) {
      const tagsData = tags.map(tagId => ({
        recipe_id: newRecipe.id,
        tag_id: tagId
      }));

      const { error: tagsError } = await supabase
        .from('recipe_tags')
        .insert(tagsData);

      if (tagsError) {
        console.error('Tags creation error:', tagsError);
        // Rollback: delete the recipe, ingredients, and steps
        await supabase.from('recipes').delete().eq('id', newRecipe.id);
        return res.status(500).json({
          success: false,
          error: 'Failed to create recipe tags'
        });
      }
    }

    // Log audit entry
    await supabase
      .from('admin_audit')
      .insert({
        user_id: user.id,
        action: 'create',
        recipe_id: newRecipe.id,
        meta: {
          title: recipe.title,
          slug: recipe.slug,
          ingredients_count: ingredients.length,
          steps_count: steps.length,
          tags_count: tags.length
        }
      });

    // Return success response with created recipe
    return res.status(201).json({
      success: true,
      data: {
        recipe: newRecipe,
        message: 'Recipe created successfully'
      }
    });

  } catch (error) {
    console.error('Create recipe API error:', error);
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
