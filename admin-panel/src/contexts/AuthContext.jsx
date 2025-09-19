import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, checkUserRole } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isModerator, setIsModerator] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setIsAdmin(false)
          setIsModerator(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      setProfile(profileData)
      setIsAdmin(profileData?.is_admin || false)
      setIsModerator(profileData?.is_moderator || false)
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
      setIsModerator(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const hasAdminAccess = () => {
    return isAdmin || isModerator
  }

  const hasAdminOnlyAccess = () => {
    return isAdmin
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    isModerator,
    signIn,
    signOut,
    hasAdminAccess,
    hasAdminOnlyAccess,
    loadUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
