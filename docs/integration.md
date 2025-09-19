# UK Food Recipes - Backend Integration Guide

This guide explains how to integrate the existing frontend with the new Supabase backend and admin panel.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Public Site   │    │   API Routes    │    │  Admin Panel    │
│   (Next.js)     │◄──►│   (Vercel)      │◄──►│  (React/Vite)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    Supabase     │
                       │   (Database +   │
                       │    Storage)     │
                       └─────────────────┘
```

## Environment Variables Setup

### For Public Frontend (Next.js)
Add to your Vercel deployment or `.env.local`:

```bash
# Supabase Configuration (Read-only access)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: API Base URL (defaults to same domain)
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

### For Admin Panel (React/Vite)
Add to your admin panel `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### For API Functions (Vercel)
Add to your Vercel project environment variables:

```bash
# Supabase Configuration (Server-side)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Frontend Integration Steps

### 1. Replace Static Data with API Calls

#### Current Implementation (using JSON file):
```javascript
// src/lib/api.ts - BEFORE
import recipesData from '../../data/recipes.json';

export async function getRecipes() {
  return { recipes: recipesData, total: recipesData.length };
}
```

#### New Implementation (using API):
```javascript
// src/lib/api.ts - AFTER
export async function getRecipes(filters, sort, limit, offset) {
  const params = new URLSearchParams();
  
  if (filters?.search) params.set('q', filters.search);
  if (filters?.cuisine?.length) params.set('cuisine', filters.cuisine.join(','));
  if (filters?.tags?.length) params.set('tag', filters.tags.join(','));
  if (filters?.difficulty?.length) params.set('difficulty', filters.difficulty.join(','));
  if (limit) params.set('limit', limit.toString());
  if (offset) params.set('page', Math.floor(offset / limit) + 1);

  const response = await fetch(`/api/public/recipes?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch recipes');
  }
  
  const { success, data, error } = await response.json();
  
  if (!success) {
    throw new Error(error || 'Failed to fetch recipes');
  }
  
  return {
    recipes: data.recipes,
    total: data.pagination.total
  };
}
```

### 2. Update Recipe Detail Pages

```javascript
// src/lib/api.ts - Recipe by slug
export async function getRecipeBySlug(slug) {
  const response = await fetch(`/api/public/recipes?slug=${slug}&limit=1`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch recipe');
  }
  
  const { success, data, error } = await response.json();
  
  if (!success) {
    throw new Error(error || 'Failed to fetch recipe');
  }
  
  return data.recipes[0] || null;
}
```

### 3. Add Featured Recipes Support

```javascript
// src/lib/api.ts - Featured recipes
export async function getFeaturedRecipes(limit = 6) {
  const response = await fetch(`/api/public/recipes?featured=true&limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch featured recipes');
  }
  
  const { success, data, error } = await response.json();
  
  if (!success) {
    throw new Error(error || 'Failed to fetch featured recipes');
  }
  
  return data.recipes;
}
```

## API Endpoints Reference

### Public API

#### GET `/api/public/recipes`
Fetch published recipes with filtering and pagination.

**Query Parameters:**
- `q` - Search query (searches title and description)
- `tag` - Filter by tag slug
- `cuisine` - Filter by cuisine
- `difficulty` - Filter by difficulty (Easy, Medium, Hard)
- `featured` - Set to "true" to get only featured recipes
- `limit` - Number of recipes per page (default: 20, max: 100)
- `page` - Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "recipes": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "search": "fish",
      "tag": "british",
      "cuisine": null,
      "difficulty": null,
      "featured": false
    }
  }
}
```

### Admin API

All admin endpoints require authentication via `Authorization: Bearer <jwt-token>` header.

#### POST `/api/admin/sign-upload`
Generate signed upload URL for recipe images.

**Request Body:**
```json
{
  "path": "recipes/image-name.jpg",
  "contentType": "image/jpeg",
  "expires": 3600
}
```

#### POST `/api/admin/create-recipe`
Create a new recipe with ingredients, steps, and tags.

**Request Body:**
```json
{
  "recipe": {
    "title": "Recipe Title",
    "slug": "recipe-slug",
    "description": "Recipe description",
    "cuisine": "British",
    "difficulty": "Easy",
    "prep_time_mins": 15,
    "cook_time_mins": 30,
    "base_servings": 4,
    "is_published": false,
    "is_featured": false
  },
  "ingredients": [
    {
      "ingredient_name": "Flour",
      "quantity": "200",
      "unit": "g",
      "notes": "",
      "sort_order": 0
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "instruction": "Mix ingredients...",
      "image_url": null,
      "image_alt": null
    }
  ],
  "tags": ["tag-id-1", "tag-id-2"]
}
```

#### PUT `/api/admin/update-recipe`
Update existing recipe.

#### DELETE `/api/admin/delete-recipe`
Delete recipe (admin only).

#### POST `/api/admin/publish-toggle`
Toggle publish status for one or more recipes.

## Deployment Instructions

### 1. Deploy Database Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `sql/schema.sql`
4. Create your first admin user:
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'your-email@domain.com';
   ```

### 2. Deploy API Functions
1. Ensure all API files are in the `/api` directory
2. Deploy to Vercel with environment variables set
3. Test endpoints using the provided examples

### 3. Deploy Admin Panel
1. Build the admin panel: `npm run build`
2. Deploy to Vercel or your preferred hosting
3. Set environment variables
4. Access at your deployed URL

### 4. Update Public Frontend
1. Replace static data imports with API calls
2. Update environment variables
3. Test recipe loading and filtering
4. Deploy updated frontend

## Testing Checklist

### Public API
- [ ] `GET /api/public/recipes` returns published recipes
- [ ] Search functionality works with `?q=` parameter
- [ ] Filtering by cuisine, tags, difficulty works
- [ ] Pagination works correctly
- [ ] Featured recipes filter works
- [ ] Unpublished recipes are not returned

### Admin API
- [ ] Authentication required for all admin endpoints
- [ ] Only admin/moderator users can access endpoints
- [ ] Recipe CRUD operations work correctly
- [ ] Image upload generates valid signed URLs
- [ ] Audit log entries are created
- [ ] Only admins can delete recipes

### Admin Panel
- [ ] Login works with Supabase Auth
- [ ] Dashboard shows correct statistics
- [ ] Recipe list loads and filters work
- [ ] Recipe editor creates/updates recipes
- [ ] Image upload works
- [ ] Bulk publish/unpublish works
- [ ] Access control works (admin vs moderator)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure Supabase project allows your domain
   - Check API endpoint URLs are correct

2. **Authentication Failures**
   - Verify JWT tokens are being sent correctly
   - Check user has admin/moderator role in profiles table

3. **Image Upload Issues**
   - Verify storage bucket exists and policies are set
   - Check signed URL generation and expiry

4. **Database Connection Issues**
   - Verify environment variables are set correctly
   - Check Supabase service role key has correct permissions

### Support

For issues with this integration:
1. Check Supabase logs for database errors
2. Check Vercel function logs for API errors
3. Verify all environment variables are set
4. Test API endpoints individually using curl or Postman

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Use Row Level Security (RLS) policies for data access control
- Validate all user inputs on the server side
- Use HTTPS for all API communications
- Regularly rotate API keys and tokens
