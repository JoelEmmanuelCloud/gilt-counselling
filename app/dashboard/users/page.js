// app/dashboard/users/page.js
'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/dashboard/AdminLayout'
import DashboardAuthWrapper from '@/components/dashboard/DashboardAuthWrapper'
import { formatDate, getRoleColor, getInitials } from '@/lib/utils'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [stats, setStats] = useState(null)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      setUsers(data.users || [])
      setStats(data.stats || {})
      setError(null)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      setUpdating(userId)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update user role')
      }
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ))
      
      // Update stats
      setStats(prevStats => {
        const newStats = { ...prevStats }
        if (newRole === 'admin') {
          newStats.admin = (newStats.admin || 0) + 1
          newStats.user = Math.max(0, (newStats.user || 0) - 1)
        } else {
          newStats.user = (newStats.user || 0) + 1
          newStats.admin = Math.max(0, (newStats.admin || 0) - 1)
        }
        return newStats
      })
      
    } catch (error) {
      console.error('Failed to update user role:', error)
      alert('Failed to update user role. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  const deleteUser = async (userId) => {
    const user = users.find(u => u._id === userId)
    if (!window.confirm(`Are you sure you want to delete ${user?.firstName || user?.email}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete user')
      }
      
      // Remove user from local state
      setUsers(users.filter(user => user._id !== userId))
      
      // Update stats
      setStats(prevStats => {
        const deletedUser = users.find(u => u._id === userId)
        const newStats = { ...prevStats }
        newStats.total = Math.max(0, (newStats.total || 0) - 1)
        
        if (deletedUser?.role === 'admin') {
          newStats.admin = Math.max(0, (newStats.admin || 0) - 1)
        } else {
          newStats.user = Math.max(0, (newStats.user || 0) - 1)
        }
        
        return newStats
      })
      
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user. Please try again.')
    }
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true
    return user.role === filter
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case 'name':
        const nameA = a.firstName || a.email || ''
        const nameB = b.firstName || b.email || ''
        return nameA.localeCompare(nameB)
      case 'email':
        return (a.email || '').localeCompare(b.email || '')
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <DashboardAuthWrapper>
        <AdminLayout pageTitle="User Management">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-deepBlue">Loading users...</p>
            </div>
          </div>
        </AdminLayout>
      </DashboardAuthWrapper>
    )
  }

  if (error) {
    return (
      <DashboardAuthWrapper>
        <AdminLayout pageTitle="User Management">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <p className="font-medium">Error loading users</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <button 
              onClick={fetchUsers}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            >
              Try Again
            </button>
          </div>
        </AdminLayout>
      </DashboardAuthWrapper>
    )
  }

  return (
    <DashboardAuthWrapper>
      <AdminLayout pageTitle="User Management">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-playfair text-3xl font-bold text-deepBlue">
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage registered users and their roles
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <button 
                onClick={fetchUsers}
                className="bg-gold hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredUsers.length} users
              </span>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-deepBlue">{stats.total || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Regular Users</p>
                    <p className="text-2xl font-bold text-deepBlue">{stats.user || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <span className="text-2xl">👑</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Administrators</p>
                    <p className="text-2xl font-bold text-deepBlue">{stats.admin || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Complete Profiles</p>
                    <p className="text-2xl font-bold text-deepBlue">{stats.profileComplete || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Filter by role:</span>
                {['all', 'user', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setFilter(role)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === role
                        ? 'bg-gold text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {role === 'all' ? 'All Users' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">👥</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'No users have registered yet.' 
                    : `No ${filter} users found.`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profile Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-gold to-yellow-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-semibold text-sm">
                                {user.image ? (
                                  <img 
                                    src={user.image} 
                                    alt={user.firstName || user.email} 
                                    className="w-10 h-10 rounded-full object-cover" 
                                  />
                                ) : (
                                  getInitials(user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email)
                                )}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.firstName || 'No name'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          )}
                          {user.emailVerified && (
                            <div className="text-xs text-green-600 flex items-center mt-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                              Verified
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role || 'user')}`}>
                            {(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.isProfileComplete ? (
                              <div className="flex items-center text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                <span className="text-sm">Complete</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-yellow-600">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                <span className="text-sm">Incomplete</span>
                              </div>
                            )}
                          </div>
                          {user.profileCompletedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(user.profileCompletedAt)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Role Update Dropdown */}
                            <select
                              value={user.role || 'user'}
                              onChange={(e) => updateUserRole(user._id, e.target.value)}
                              disabled={updating === user._id}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gold focus:border-transparent disabled:opacity-50"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1"
                              title="Delete user"
                              disabled={updating === user._id}
                            >
                              {updating === user._id ? (
                                <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-blue-600 text-xl mr-3">ℹ️</span>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">User Management Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Admin users have full access to the dashboard and can manage other users</li>
                  <li>• Regular users can book appointments and access their profile</li>
                  <li>• Profile completion includes first name, last name, and phone number</li>
                  <li>• You cannot delete your own admin account</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </DashboardAuthWrapper>
  )
}