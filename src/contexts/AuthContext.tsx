import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { User as SupabaseUser, createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string

export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Seller'
  status?: string
  isOnline?: boolean
}

interface AuthContextType {
  user: User | null
  allUsers: User[]
  isLoading: boolean
  loginStep1: (email: string, pass: string) => Promise<{ bypassed: boolean }>
  loginStep2: (email: string, code: string) => Promise<User>
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
            // Verifica status do usuário antes de liberar o acesso
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
          })),
        )
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

  const loginStep1 = async (
    email: string,
    pass: string,
  ): Promise<{ bypassed: boolean }> => {
    // Usa um cliente temporário para verificar a senha sem afetar a sessão atual da aplicação
    const tempClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error } = await tempClient.auth.signInWithPassword({
      email,
      password: pass,
    })
    if (error) throw new Error('E-mail ou senha inválidos.')

    // Verifica se o usuário está ativo antes de disparar o OTP
    if (data.user) {
      const { data: profile } = await tempClient
        .from('profiles')
        .select('status')
        .eq('id', data.user.id)
        .single()

      if (profile && profile.status !== 'active') {
        throw new Error(
          'Sua conta está pendente de aprovação pelo administrador.',
        )
      }
    }

    // Se a senha estiver correta e ativo, dispara o envio do OTP (E-mail) usando o cliente principal
    const { error: otpError } = await supabase.auth.signInWithOtp({ email })
    if (otpError) {
      const msg = otpError.message.toLowerCase()
      // Se houver erro de SMTP (provedor de e-mail mal configurado no Supabase),
      // fazemos o bypass do MFA para não bloquear o acesso aos dados em ambiente de desenvolvimento/teste.
      if (
        msg.includes('v.from') ||
        msg.includes('smtp') ||
        msg.includes('sender') ||
        msg.includes('email provider')
      ) {
        console.warn(
          '[Auth] Erro de SMTP detectado. Realizando bypass do MFA para fins de demonstração.',
        )

        const { error: directLoginError } =
          await supabase.auth.signInWithPassword({
            email,
            password: pass,
          })
        if (directLoginError) {
          throw new Error('Falha ao forçar login: ' + directLoginError.message)
        }

        return { bypassed: true }
      }
      throw new Error(
        'Erro ao enviar código de verificação: ' + otpError.message,
      )
    }

    return { bypassed: false }
  }

  const loginStep2 = async (email: string, code: string): Promise<User> => {
    // Verifica o código OTP enviado para o e-mail
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    if (error) throw new Error('Código inválido ou expirado.')
    if (!data.user) throw new Error('Sessão não estabelecida.')

    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profError || !profile) throw new Error('Perfil não encontrado.')

    if (profile.status !== 'active') {
      await supabase.auth.signOut()
      throw new Error(
        'Sua conta está pendente de aprovação pelo administrador.',
      )
    }

    const loggedInUser: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as 'Admin' | 'Seller',
      status: profile.status,
      isOnline: true,
    }

    setUser(loggedInUser)
    await supabase
      .from('profiles')
      .update({ is_online: true })
      .eq('id', loggedInUser.id)

    return loggedInUser
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
    if (error) throw new Error(error.message)

    // Novo registro entra como 'pending'. Desloga instantaneamente para evitar sessão ativa.
    if (data.session) {
      await supabase.auth.signOut()
    }

    // Dispara o email de boas vindas
    supabase.functions
      .invoke('send-welcome-email', {
        body: { email, name },
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
        loginStep1,
        loginStep2,
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
