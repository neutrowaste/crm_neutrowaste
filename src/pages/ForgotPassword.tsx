import { useState, useEffect } from 'react'
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
  const [smtpError, setSmtpError] = useState(false)

  const [countdown, setCountdown] = useState(() => {
    const savedCooldown = localStorage.getItem('forgotPasswordCooldown')
    if (savedCooldown) {
      const remaining = Math.ceil(
        (parseInt(savedCooldown, 10) - Date.now()) / 1000,
      )
      return remaining > 0 ? remaining : 0
    }
    return 0
  })

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  })

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => {
          const next = c - 1
          if (next <= 0) {
            localStorage.removeItem('forgotPasswordCooldown')
          } else {
            localStorage.setItem(
              'forgotPasswordCooldown',
              (Date.now() + next * 1000).toString(),
            )
          }
          return next
        })
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const startCooldown = (seconds: number) => {
    setCountdown(seconds)
    localStorage.setItem(
      'forgotPasswordCooldown',
      (Date.now() + seconds * 1000).toString(),
    )
  }

  const onSubmit = async (data: ForgotFormValues) => {
    if (countdown > 0) return

    setIsLoading(true)
    setSmtpError(false)
    try {
      const email = data.email.trim()

      let timeoutId: NodeJS.Timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          const err: any = new Error('upstream request timeout')
          err.status = 504
          reject(err)
        }, 15000)
      })

      const response = await Promise.race([
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        }),
        timeoutPromise,
      ]).finally(() => {
        if (timeoutId) clearTimeout(timeoutId)
      })

      const error = response?.error

      if (error) {
        const msg = String(error.message).toLowerCase()
        if (
          error.status === 429 ||
          msg.includes('rate limit') ||
          msg.includes('60 seconds') ||
          (error as any).code === 'over_email_send_rate_limit'
        ) {
          startCooldown(60)
          toast({
            variant: 'destructive',
            title: 'Muitas tentativas',
            description:
              'Limite de envios atingido. Aguarde alguns minutos antes de tentar novamente.',
          })
          setIsLoading(false)
          return // Impede o throw para não disparar erro de uncaught promise no log
        }
        throw error
      }

      const { error: logError } = await supabase.from('logs').insert({
        action: 'Recuperação de Senha',
        details: `Solicitação de redefinição de senha enviada para: ${email}`,
        lead_name: 'Sistema',
        user_name: email,
      })

      if (logError) {
        console.warn('Falha ao registrar log de recuperação de senha.')
      }

      setSubmittedEmail(email)
      setIsSuccess(true)
      startCooldown(60) // Prevent immediate resend
    } catch (error: any) {
      let errorMessage =
        'Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde.'

      const msg = String(error?.message || '').toLowerCase()

      if (
        error?.status === 429 ||
        msg.includes('rate limit') ||
        msg.includes('60 seconds') ||
        error?.code === 'over_email_send_rate_limit'
      ) {
        startCooldown(60)
        errorMessage =
          'Muitas tentativas ou limite de envios atingido. Aguarde alguns minutos antes de tentar novamente.'
      } else if (msg.includes('not allowed') || msg.includes('redirect')) {
        errorMessage =
          'Configuração de URL de redirecionamento inválida no servidor.'
      } else if (
        msg.includes('timeout') ||
        msg.includes('gateway') ||
        msg.includes('504') ||
        error?.status === 504
      ) {
        setSmtpError(true)
        errorMessage =
          'O servidor de e-mail demorou muito para responder (Timeout 504). Isso indica uma possível falha de conexão no provedor SMTP configurado.'
      } else if (
        msg.includes('v.from') ||
        msg.includes('smtp') ||
        msg.includes('sender') ||
        msg.includes('email provider')
      ) {
        setSmtpError(true)
        errorMessage =
          'Falha de autenticação no provedor de e-mail (SMTP) do Supabase.'
      } else if (error?.message) {
        errorMessage = `Falha reportada pelo servidor: ${error.message}`
      }

      toast({
        variant: 'destructive',
        title: 'Erro ao enviar e-mail',
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    if (countdown > 0) {
      toast({
        variant: 'destructive',
        title: 'Aguarde',
        description: `Por favor, aguarde ${countdown} segundos antes de tentar novamente.`,
      })
      return
    }
    setIsSuccess(false)
    setSmtpError(false)
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
            {smtpError && !isSuccess && (
              <div className="mb-6 rounded-md bg-destructive/10 p-4 border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                <div className="flex">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertTriangle
                      className="h-5 w-5 text-destructive"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-full">
                    <h3 className="text-sm font-semibold text-destructive">
                      Erro de Configuração SMTP
                    </h3>
                    <div className="mt-2 text-sm text-destructive/90 space-y-2">
                      <p>
                        Ocorreu uma falha ou demora excessiva ao tentar
                        comunicar com o provedor de e-mail configurado.
                      </p>
                      <p className="font-medium text-xs mt-2">
                        Solução para o Administrador:
                      </p>
                      <ul className="list-disc pl-4 text-xs space-y-1">
                        <li>Acesse o painel do projeto no Supabase.</li>
                        <li>
                          Vá em{' '}
                          <strong>
                            Authentication &gt; Providers &gt; Email
                          </strong>
                          .
                        </li>
                        <li>
                          Desative a opção <strong>Custom SMTP</strong> ou
                          verifique as configurações de rede/autenticação do
                          provedor utilizado.
                        </li>
                      </ul>
                      <div className="pt-3 flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-background hover:bg-muted text-foreground"
                          onClick={() => {
                            setSubmittedEmail(
                              form.getValues('email') || 'teste@exemplo.com',
                            )
                            setIsSuccess(true)
                            setSmtpError(false)
                          }}
                        >
                          Ignorar erro e ver tela de sucesso (Teste UI)
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                    disabled={countdown > 0}
                  >
                    {countdown > 0
                      ? `Aguarde ${countdown}s para tentar novamente`
                      : 'Não recebi. Tentar novamente'}
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
                            disabled={isLoading || countdown > 0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || countdown > 0}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {countdown > 0
                      ? `Aguarde ${countdown}s`
                      : 'Enviar link de recuperação'}
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
