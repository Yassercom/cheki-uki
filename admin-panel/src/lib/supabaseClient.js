import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to check if user is admin or moderator
export const checkUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isAdmin: false, isModerator: false, user: null }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, is_moderator')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return { isAdmin: false, isModerator: false, user }
  }

  return {
    isAdmin: profile?.is_admin || false,
    isModerator: profile?.is_moderator || false,
    user
  }
}

// Helper function to get authenticated user with role
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    profile: profile || {}
  }
}
