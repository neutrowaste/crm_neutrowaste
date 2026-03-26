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

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

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
        title: 'Aviso de Segurança',
        description: location.state.message,
      })
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, toast])

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error.message || 'Verifique suas credenciais.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fillMock = (role: 'admin' | 'seller') => {
    if (role === 'admin') {
      form.setValue('email', 'admin@neutrowaste.com')
      form.setValue('password', 'admin123')
    } else {
      form.setValue('email', 'vendedor@neutrowaste.com')
      form.setValue('password', 'vendedor123')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <img
            src={logoImg}
            alt="Neutrowaste Logo"
            className="h-12 object-contain"
          />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie seus leads B2B de forma inteligente.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
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

            <div className="mt-6 rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">Contas de teste:</p>
                  <p className="mt-3 text-sm md:ml-6 md:mt-0">
                    <button
                      type="button"
                      onClick={() => fillMock('admin')}
                      className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
                    >
                      Admin
                    </button>
                    <span className="mx-2 text-blue-400">|</span>
                    <button
                      type="button"
                      onClick={() => fillMock('seller')}
                      className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
                    >
                      Vendedor
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
