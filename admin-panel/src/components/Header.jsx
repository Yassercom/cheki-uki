import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { user, profile, signOut, isAdmin, isModerator } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-gray-900">
                  {profile?.full_name || user?.email || 'Admin User'}
                </span>
                <span className="text-xs text-gray-500">
                  {isAdmin ? 'Administrator' : isModerator ? 'Moderator' : 'User'}
                </span>
              </div>
              
              <div className="relative">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(profile?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
