import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { Search, Loader2, Users } from 'lucide-react'
import type { Profile, Balance } from '../../types/database'

interface UserWithBalances extends Profile {
  balances?: Balance[]
}

export function UserList() {
  const [users, setUsers] = useState<UserWithBalances[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithBalances[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = users.filter(user => 
      user.uid.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  async function loadUsers() {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      const { data: balances, error: balancesError } = await supabase
        .from('balances')
        .select('*')

      if (balancesError) throw balancesError

      const usersWithBalances = profiles.map(profile => ({
        ...profile,
        balances: balances.filter(b => b.user_id === profile.id)
      }))

      setUsers(usersWithBalances)
      setFilteredUsers(usersWithBalances)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
          <div className="text-sm text-gray-400">
            {filteredUsers.length} user(s)
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by UID, email, or user ID..."
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No users found matching your search' : 'No users yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">UID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Balances</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UserRow({ user }: { user: UserWithBalances }) {
  const [expanded, setExpanded] = useState(false)

  const hasBalances = user.balances && user.balances.length > 0

  return (
    <>
      <tr 
        className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 px-4 text-sm font-medium text-white">
          {user.uid}
        </td>
        <td className="py-3 px-4 text-sm text-gray-300">
          {user.email || '-'}
        </td>
        <td className="py-3 px-4 text-sm text-gray-400">
          {new Date(user.created_at).toLocaleDateString()}
        </td>
        <td className="py-3 px-4 text-sm">
          {hasBalances ? (
            <span className="text-green-400 font-medium">
              {user.balances?.length} token(s)
            </span>
          ) : (
            <span className="text-gray-500">No balances</span>
          )}
        </td>
      </tr>
      {expanded && hasBalances && (
        <tr className="bg-slate-700/20">
          <td colSpan={4} className="py-4 px-4">
            <div className="ml-8 space-y-2">
              <div className="text-sm font-medium text-gray-400 mb-3">Token Balances:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {user.balances?.map((balance) => (
                  <div 
                    key={balance.id}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-600"
                  >
                    <div className="text-xs text-gray-400 mb-1">{balance.token}</div>
                    <div className="text-lg font-semibold text-white">
                      {parseFloat(balance.amount).toFixed(8)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-3">
                User ID: <span className="font-mono">{user.id}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
