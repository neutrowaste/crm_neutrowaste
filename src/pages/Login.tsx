import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import logoImg from '../assets/neutrowaste-0b9d5.jpg'
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export default function Login() {
  const { login, user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)
  const [serverErrorMsg, setServerErrorMsg] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: 'Aviso',
        description: location.state.message,
      })
      navigate(location.pathname, { replace: true, state: {} })
    }

    const savedAttempts = localStorage.getItem('loginAttempts')
    const savedLockout = localStorage.getItem('lockoutUntil')

    if (savedAttempts) setFailedAttempts(parseInt(savedAttempts))
    if (savedLockout) {
      const lockoutTime = parseInt(savedLockout)
      if (Date.now() < lockoutTime) {
        setLockoutUntil(lockoutTime)
      } else {
        localStorage.removeItem('loginAttempts')
        localStorage.removeItem('lockoutUntil')
        setFailedAttempts(0)
      }
    }
  }, [location.state, navigate, toast])

  const handleFailedAttempt = () => {
    const newAttempts = failedAttempts + 1
    setFailedAttempts(newAttempts)
    localStorage.setItem('loginAttempts', newAttempts.toString())

    if (newAttempts >= MAX_ATTEMPTS) {
      const lockTime = Date.now() + LOCKOUT_MINUTES * 60000
      setLockoutUntil(lockTime)
      localStorage.setItem('lockoutUntil', lockTime.toString())
      toast({
        variant: 'destructive',
        title: 'Conta Bloqueada',
        description: `Muitas tentativas falhas. Tente novamente em ${LOCKOUT_MINUTES} minutos.`,
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: `Credenciais inválidas. Tentativa ${newAttempts} de ${MAX_ATTEMPTS}.`,
      })
    }
  }

  const onSubmit = async (data: LoginFormValues) => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const minsLeft = Math.ceil((lockoutUntil - Date.now()) / 60000)
      toast({
        variant: 'destructive',
        title: 'Bloqueado',
        description: `Aguarde ${minsLeft} minutos antes de tentar novamente.`,
      })
      return
    }

    setIsLoading(true)
    setServerErrorMsg(null)

    try {
      await login(data.email, data.password)
      setFailedAttempts(0)
      localStorage.removeItem('loginAttempts')

      toast({
        title: 'Login bem-sucedido',
        description: 'Redirecionando...',
      })
      navigate('/dashboard')
    } catch (error: any) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('inválidos') || msg.includes('inválida')) {
        handleFailedAttempt()
      } else if (msg.includes('confirmado')) {
        toast({
          variant: 'destructive',
          title: 'Acesso Negado',
          description: error.message,
        })
      } else if (msg.includes('pendente')) {
        toast({
          variant: 'destructive',
          title: 'Conta em Análise',
          description: error.message,
        })
      } else {
        setServerErrorMsg(error.message)
        toast({
          variant: 'destructive',
          title: 'Falha de Conexão com Servidor',
          description: `Tivemos um problema técnico. Atualize a página e tente novamente.`,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-zinc-950 p-4 sm:p-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[25%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-[420px] bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-zinc-800 p-6 sm:p-10 relative z-10 animate-fade-in-up duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 flex items-center justify-center">
            <img
              src={logoImg}
              alt="Neutrowaste Logo"
              className="h-12 w-auto object-contain dark:brightness-200"
            />
          </div>
        </div>

        {lockoutUntil && Date.now() < lockoutUntil ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 rounded-lg text-sm text-center font-medium border border-red-100 dark:border-red-900/50">
            Conta bloqueada temporariamente. Tente novamente mais tarde.
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {serverErrorMsg && (
                <div className="rounded-lg bg-destructive/10 p-3.5 border border-destructive/20 text-sm flex gap-2.5 text-destructive animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">Erro de Servidor</strong>
                    <p className="opacity-90 text-xs leading-relaxed">
                      {serverErrorMsg}
                    </p>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="voce@exemplo.com"
                        type="email"
                        disabled={isLoading}
                        className="h-11 rounded-lg bg-slate-50/50 dark:bg-zinc-900/50 focus-visible:bg-white dark:focus-visible:bg-zinc-900 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                        Senha
                      </FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? 'text' : 'password'}
                          disabled={isLoading}
                          className="h-11 rounded-lg bg-slate-50/50 dark:bg-zinc-900/50 focus-visible:bg-white dark:focus-visible:bg-zinc-900 transition-colors pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-9 w-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-medium text-[15px] shadow-sm hover:shadow transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? 'Acessando...' : 'Entrar na plataforma'}
              </Button>
            </form>
          </Form>
        )}

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Ainda não tem uma conta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  )
}
