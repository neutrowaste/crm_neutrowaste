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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      } else if (
        msg.includes('smtp') ||
        msg.includes('sender') ||
        msg.includes('provider')
      ) {
        toast({
          variant: 'destructive',
          title: 'Erro de Configuração SMTP',
          description: `Falha reportada pelo servidor: ${error.message}`,
        })
      } else {
        // Erros de banco ou infraestrutura
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12 transition-colors">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <img
            src={logoImg}
            alt="Neutrowaste Logo"
            className="h-12 object-contain dark:brightness-200 dark:contrast-200"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login Seguro</CardTitle>
          </CardHeader>
          <CardContent>
            {lockoutUntil && Date.now() < lockoutUntil ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 rounded-md text-sm text-center font-medium">
                Conta temporariamente bloqueada. Tente novamente mais tarde.
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {serverErrorMsg && (
                    <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20 text-sm flex gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Erro de Servidor:</strong>
                        <p className="opacity-90 text-xs mt-1">
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
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="voce@exemplo.com"
                            type="email"
                            disabled={isLoading}
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
                          <FormLabel>Senha</FormLabel>
                          <Link
                            to="/forgot-password"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Esqueceu sua senha?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="••••••••"
                              type={showPassword ? 'text' : 'password'}
                              disabled={isLoading}
                              className="pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showPassword
                                  ? 'Ocultar senha'
                                  : 'Mostrar senha'}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Entrar
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Criar Conta
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
