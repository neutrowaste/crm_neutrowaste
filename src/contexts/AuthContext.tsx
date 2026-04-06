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
  status?: string
  isOnline?: boolean
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  allUsers: User[]
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (name: string, email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
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
            if (profile.status !== 'active') {
              supabase.auth.signOut()
              setUser(null)
              setIsLoading(false)
              return
            }

            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as 'Admin' | 'Seller',
              status: profile.status,
              isOnline: profile.is_online,
              avatarUrl: profile.avatar_url,
            })
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
            status: p.status,
            isOnline: p.is_online,
            avatarUrl: p.avatar_url,
          })),
        )

        if (user) {
          const currentUserProfile = data.find((p) => p.id === user.id)
          if (currentUserProfile) {
            if (currentUserProfile.status !== 'active') {
              supabase.auth.signOut()
              setUser(null)
              return
            }

            setUser((prev) => {
              if (!prev) return null
              if (
                prev.name !== currentUserProfile.name ||
                prev.role !== currentUserProfile.role ||
                prev.status !== currentUserProfile.status ||
                prev.isOnline !== currentUserProfile.is_online ||
                prev.avatarUrl !== currentUserProfile.avatar_url
              ) {
                return {
                  ...prev,
                  name: currentUserProfile.name,
                  role: currentUserProfile.role as 'Admin' | 'Seller',
                  status: currentUserProfile.status,
                  isOnline: currentUserProfile.is_online,
                  avatarUrl: currentUserProfile.avatar_url,
                }
              }
              return prev
            })
          } else {
            supabase.auth.signOut()
            setUser(null)
          }
        }
      }
    }
    fetchUsers()

    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
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

  const login = async (email: string, pass: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', data.user.id)
          .single()

        if (profile && profile.status !== 'active') {
          await supabase.auth.signOut()
          throw new Error(
            'Sua conta está pendente de aprovação pelo administrador.',
          )
        }
      }
    } catch (error: any) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('email not confirmed')) {
        throw new Error(
          'E-mail não confirmado. Verifique sua caixa de entrada ou contate o administrador.',
        )
      }
      if (
        msg.includes('invalid login credentials') ||
        msg.includes('invalid credentials')
      ) {
        throw new Error('E-mail ou senha inválidos.')
      }
      throw error
    }
  }

  const register = async (name: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (
        msg.includes('smtp') ||
        msg.includes('sender') ||
        msg.includes('v.from') ||
        msg.includes('email provider')
      ) {
        throw new Error(
          'Falha de envio de e-mail (Erro SMTP). O administrador precisa corrigir as credenciais no painel do Supabase.',
        )
      }
      throw new Error(error.message)
    }

    if (data.session) {
      await supabase.auth.signOut()
    }

    supabase.functions
      .invoke('send-email', {
        body: { email, type: 'welcome', data: { name } },
      })
      .catch(console.error)
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
