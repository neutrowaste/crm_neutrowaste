import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import logoImg from '../assets/neutrowaste-0b9d5.jpg'
import { Loader2, MailCheck, ArrowLeft, AlertTriangle } from 'lucide-react'

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido.'),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPassword() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Log para auditoria de disparo de e-mail
      await supabase
        .from('logs')
        .insert({
          action: 'Recuperação de Senha',
          details: `Solicitação de redefinição de senha enviada para: ${data.email}`,
          lead_name: 'Sistema',
          user_name: data.email,
        })
        .catch(console.error)

      setSubmittedEmail(data.email)
      setIsSuccess(true)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          'Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    setIsSuccess(false)
    form.reset({ email: submittedEmail })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-background p-4 py-12 transition-colors">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <img
            src={logoImg}
            alt="Neutrowaste Logo"
            className="h-12 object-contain dark:brightness-200 dark:contrast-200"
          />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">
            Recuperar senha
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Redefina sua senha
            </CardTitle>
            {!isSuccess && (
              <CardDescription className="text-center text-sm pt-2">
                Digite o endereço de e-mail associado à sua conta e enviaremos
                um link para redefinir sua senha.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                  <MailCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verifique sua caixa de entrada. Se existir uma conta para{' '}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {submittedEmail}
                  </span>
                  , você receberá um link de recuperação em breve.
                </p>

                <div className="w-full rounded-md bg-yellow-50 dark:bg-yellow-950/30 p-4 border border-yellow-200 dark:border-yellow-900/50">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle
                        className="h-5 w-5 text-yellow-600 dark:text-yellow-500"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 text-left">
                        Não encontrou no Gmail?
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400/80 text-left">
                        <p>
                          Verifique as pastas de <strong>Spam</strong> ou{' '}
                          <strong>Lixo Eletrônico</strong>. Devido a políticas
                          rigorosas de segurança, a mensagem pode ser filtrada.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 w-full space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar ao login
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={handleResend}
                  >
                    Não recebi. Tentar novamente
                  </Button>
                </div>
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
                        <FormLabel>E-mail cadastrado</FormLabel>
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enviar link de recuperação
                  </Button>
                  <div className="mt-6 text-center text-sm">
                    <Link
                      to="/login"
                      className="font-medium text-primary hover:underline inline-flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-3 w-3" />
                      Voltar ao login
                    </Link>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
