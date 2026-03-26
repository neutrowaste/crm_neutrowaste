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
import { Loader2, Info } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

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
        toast({
          variant: 'destructive',
          title: 'Erro ao entrar',
          description: `Falha reportada pelo servidor: ${error.message}`,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fillMock = (role: 'admin1' | 'admin2') => {
    if (role === 'admin1') {
      form.setValue('email', 'hugo.valle@neutrowaste.com')
      form.setValue('password', 'securepassword123')
    } else {
      form.setValue('email', 'admin@neutrowaste.com')
      form.setValue('password', 'admin123')
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
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie seus leads B2B de forma inteligente.
          </p>
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
                          <Input
                            placeholder="••••••••"
                            type="password"
                            disabled={isLoading}
                            {...field}
                          />
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

            <div className="mt-6 rounded-md bg-blue-50 dark:bg-blue-950/40 p-4 border border-blue-100 dark:border-blue-900">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    Preencher dados de teste:
                  </p>
                  <p className="mt-3 text-sm md:ml-6 md:mt-0 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fillMock('admin1')}
                      className="whitespace-nowrap font-medium text-blue-700 dark:text-blue-300 hover:underline text-left"
                    >
                      Admin (Hugo)
                    </button>
                    <button
                      type="button"
                      onClick={() => fillMock('admin2')}
                      className="whitespace-nowrap font-medium text-blue-700 dark:text-blue-300 hover:underline text-left"
                    >
                      Admin (Padrão)
                    </button>
                  </p>
                </div>
              </div>
            </div>

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
