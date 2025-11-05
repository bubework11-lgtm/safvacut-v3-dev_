import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  uid: string
  email: string | null
  created_at: string
}

interface UserData {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
}

export function useUser() {
  const [userData, setUserData] = useState<UserData>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user)
      } else {
        setUserData({ user: null, profile: null, loading: false, isAdmin: false })
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user)
      } else {
        setUserData({ user: null, profile: null, loading: false, isAdmin: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserData(user: User) {
    try {
      // Load profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Check if admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      setUserData({
        user,
        profile,
        loading: false,
        isAdmin: !!adminData,
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      setUserData({ user, profile: null, loading: false, isAdmin: false })
    }
  }

  return userData
}
