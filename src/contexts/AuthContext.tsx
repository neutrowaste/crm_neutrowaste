import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Seller'
  isOnline?: boolean
}

interface AuthContextType {
  user: User | null
  allUsers: User[]
  isLoading: boolean
  login: (email: string, pass: string) => Promise<User>
  register: (
    name: string,
    email: string,
    pass: string,
    role: 'Admin' | 'Seller',
  ) => Promise<void>
  logout: () => Promise<void>
  finalizeLogin: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sessionUser, setSessionUser] = useState<SupabaseUser | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSessionUser(session?.user ?? null)
      if (!session?.user) {
        setUser(null)
        setIsLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null)
      if (!session?.user) {
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (sessionUser) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as 'Admin' | 'Seller',
              isOnline: profile.is_online,
            })
            // Update online status
            supabase
              .from('profiles')
              .update({ is_online: true })
              .eq('id', profile.id)
              .then()
          }
          setIsLoading(false)
        })
    }
  }, [sessionUser])

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('*')
      if (data) {
        setAllUsers(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role as 'Admin' | 'Seller',
            isOnline: p.is_online,
          })),
        )
      }
    }
    fetchUsers()

    // Realtime channel for users status
    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          fetchUsers()
        },
      )
      .subscribe()

    const handleBeforeUnload = () => {
      if (user) {
        supabase
          .from('profiles')
          .update({ is_online: false })
          .eq('id', user.id)
          .then()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      supabase.removeChannel(channel)
    }
  }, [user])

  const login = async (email: string, pass: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    })
    if (error) throw new Error('E-mail ou senha inválidos.')

    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profError || !profile) throw new Error('Perfil não encontrado.')

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as 'Admin' | 'Seller',
      isOnline: true,
    }
  }

  const finalizeLogin = async (loggedInUser: User) => {
    setUser(loggedInUser)
    await supabase
      .from('profiles')
      .update({ is_online: true })
      .eq('id', loggedInUser.id)
  }

  const register = async (
    name: string,
    email: string,
    pass: string,
    role: 'Admin' | 'Seller',
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name,
          role,
        },
      },
    })
    if (error) throw new Error(error.message)
    if (data.user) {
      setUser({
        id: data.user.id,
        name,
        email,
        role,
        isOnline: true,
      })
      await supabase
        .from('profiles')
        .update({ is_online: true })
        .eq('id', data.user.id)
    }
  }

  const logout = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ is_online: false })
        .eq('id', user.id)
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        isLoading,
        login,
        register,
        logout,
        finalizeLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
