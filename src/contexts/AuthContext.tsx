import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface User {
  id: string
  name: string
  email: string
  role: string
  status?: string
  isOnline?: boolean
  avatarUrl?: string
  forcePasswordChange?: boolean
  permissions?: string[]
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

const getPublicAvatarUrl = (url: string | null) => {
  if (!url) return undefined
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return supabase.storage.from('avatars').getPublicUrl(url).data.publicUrl
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadProfile = async (authUser: SupabaseUser) => {
      setIsLoading(true)
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error || !profile) {
          if (mounted) {
            setUser(null)
            setIsLoading(false)
          }
          return
        }

        if (profile.status !== 'active') {
          await supabase.auth.signOut()
          if (mounted) {
            setUser(null)
            setIsLoading(false)
          }
          return
        }

        const { data: roleData } = await supabase
          .from('app_roles')
          .select('permissions')
          .eq('name', profile.role)
          .single()

        if (mounted) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            status: profile.status,
            isOnline: profile.is_online,
            avatarUrl: getPublicAvatarUrl(profile.avatar_url),
            forcePasswordChange: profile.force_password_change,
            permissions:
              roleData?.permissions || (profile.role === 'Admin' ? ['*'] : []),
          })
          setIsLoading(false)
        }

        supabase
          .from('profiles')
          .update({
            is_online: true,
            last_sign_in_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
          .then()
      } catch (err) {
        console.error('Error loading profile', err)
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    const checkSession = (session: any) => {
      if (!mounted) return
      const currentId = session?.user?.id || null

      if (currentId !== userIdRef.current) {
        userIdRef.current = currentId
        if (currentId && session?.user) {
          loadProfile(session.user)
        } else {
          setUser(null)
          setIsLoading(false)
        }
      } else if (!currentId) {
        setIsLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      checkSession(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setAllUsers([])
      return
    }

    let mounted = true

    const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('*')
      if (data && mounted) {
        setAllUsers(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role,
            status: p.status,
            isOnline: p.is_online,
            avatarUrl: getPublicAvatarUrl(p.avatar_url),
            forcePasswordChange: p.force_password_change,
          })),
        )

        const me = data.find((p) => p.id === user.id)
        if (me) {
          if (me.status !== 'active') {
            supabase.auth.signOut()
            return
          }

          setUser((prev) => {
            if (!prev) return null
            const newAvatarUrl = getPublicAvatarUrl(me.avatar_url)
            if (
              prev.name !== me.name ||
              prev.role !== me.role ||
              prev.status !== me.status ||
              prev.isOnline !== me.is_online ||
              prev.avatarUrl !== newAvatarUrl ||
              prev.forcePasswordChange !== me.force_password_change
            ) {
              return {
                ...prev,
                name: me.name,
                role: me.role,
                status: me.status,
                isOnline: me.is_online,
                avatarUrl: newAvatarUrl,
                forcePasswordChange: me.force_password_change,
              }
            }
            return prev
          })
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
      supabase
        .from('profiles')
        .update({ is_online: false })
        .eq('id', user.id)
        .then()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      mounted = false
      window.removeEventListener('beforeunload', handleBeforeUnload)
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const login = async (email: string, pass: string): Promise<void> => {
    try {
      setIsLoading(true)
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
      setIsLoading(false)
      const msg = error.message?.toLowerCase() || ''
      if (
        msg.includes('edge function returned a non-2xx') ||
        msg.includes('functionshttp')
      ) {
        throw new Error(
          'Falha em um serviço interno. O administrador precisa verificar os logs.',
        )
      }
      if (msg.includes('email not confirmed')) {
        throw new Error(
          'E-mail não confirmado. Verifique sua caixa de entrada.',
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
    userIdRef.current = null
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
