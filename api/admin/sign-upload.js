// ============================================================================
// Admin Sign Upload API - Vercel Serverless Function
// POST /api/admin/sign-upload
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
    const { path, contentType, expires = 3600 } = req.body;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: path'
      });
    }

    // Validate file path (security check)
    if (!path.startsWith('recipes/') || path.includes('..')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file path'
      });
    }

    // Generate signed upload URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('recipe-images')
      .createSignedUploadUrl(path, {
        expiresIn: expires,
        upsert: true
      });

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate upload URL'
      });
    }

    // Return the signed URL
    return res.status(200).json({
      success: true,
      data: {
        url: signedUrlData.signedUrl,
        path: path,
        expires: new Date(Date.now() + expires * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Sign upload API error:', error);
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
