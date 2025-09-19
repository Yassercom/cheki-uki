import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    publishedRecipes: 0,
    draftRecipes: 0,
    featuredRecipes: 0,
    loading: true
  })

  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get recipe counts
      const { data: allRecipes, error: recipesError } = await supabase
        .from('recipes')
        .select('id, is_published, is_featured')

      if (recipesError) throw recipesError

      const totalRecipes = allRecipes.length
      const publishedRecipes = allRecipes.filter(r => r.is_published).length
      const draftRecipes = totalRecipes - publishedRecipes
      const featuredRecipes = allRecipes.filter(r => r.is_featured).length

      // Get recent audit activity
      const { data: auditData, error: auditError } = await supabase
        .from('admin_audit')
        .select(`
          id,
          action,
          created_at,
          meta,
          profiles!inner(full_name, email),
          recipes(title, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (auditError) {
        console.error('Error loading audit data:', auditError)
      }

      setStats({
        totalRecipes,
        publishedRecipes,
        draftRecipes,
        featuredRecipes,
        loading: false
      })

      setRecentActivity(auditData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const StatCard = ({ title, value, icon, color = 'blue' }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 bg-${color}-500 rounded-md flex items-center justify-center`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {stats.loading ? '...' : value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'create':
        return <span className="text-green-500">+</span>
      case 'update':
        return <span className="text-blue-500">✏️</span>
      case 'delete':
        return <span className="text-red-500">🗑️</span>
      case 'publish':
        return <span className="text-purple-500">📢</span>
      case 'unpublish':
        return <span className="text-gray-500">📝</span>
      default:
        return <span className="text-gray-400">•</span>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to the UK Food Recipes admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Recipes"
          value={stats.totalRecipes}
          color="blue"
          icon={
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Published"
          value={stats.publishedRecipes}
          color="green"
          icon={
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          title="Drafts"
          value={stats.draftRecipes}
          color="yellow"
          icon={
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          }
        />
        <StatCard
          title="Featured"
          value={stats.featuredRecipes}
          color="purple"
          icon={
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                Activity will appear here as you manage recipes.
              </p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== recentActivity.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          {getActionIcon(activity.action)}
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">
                                {activity.profiles?.full_name || activity.profiles?.email || 'Unknown user'}
                              </span>
                              {' '}
                              <span className="capitalize">{activity.action}</span>
                              {activity.recipes && (
                                <>
                                  {' recipe '}
                                  <span className="font-medium">
                                    {activity.recipes.title}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate(activity.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/recipes/new"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Create New Recipe
              </span>
            </a>
            
            <a
              href="/recipes"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Manage Recipes
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
