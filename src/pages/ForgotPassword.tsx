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
import {
  Loader2,
  MailCheck,
  ArrowLeft,
  AlertTriangle,
  Timer,
} from 'lucide-react'

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

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  })

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const onSubmit = async (data: ForgotFormValues) => {
    if (countdown > 0) return

    setIsLoading(true)
    setSmtpError(false)
    const email = data.email.trim()

    // Verificação de bloqueio persistente para evitar rate limit (HTTP 429)
    const blockedUntil = localStorage.getItem(`fp_block_${email}`)
    if (blockedUntil) {
      const blockTime = parseInt(blockedUntil, 10)
      if (blockTime > Date.now()) {
        const remaining = Math.ceil((blockTime - Date.now()) / 1000)
        startCooldown(remaining)
        toast({
          variant: 'destructive',
          title: 'Muitas tentativas',
          description: `Limite atingido. Aguarde ${formatTime(remaining)} antes de tentar novamente.`,
        })
        setIsLoading(false)
        return
      } else {
        localStorage.removeItem(`fp_block_${email}`)
      }
    }

    try {
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
        throw error
      }

      supabase
        .from('logs')
        .insert({
          action: 'Recuperação de Senha',
          details: `Solicitação de redefinição de senha enviada para: ${email}`,
          lead_name: 'Sistema',
          user_name: email,
        })
        .then()

      setSubmittedEmail(email)
      setIsSuccess(true)
      startCooldown(60)
    } catch (error: any) {
      const msg = String(error?.message || '').toLowerCase()

      if (
        error?.status === 429 ||
        msg.includes('rate limit') ||
        error?.code === 'over_email_send_rate_limit'
      ) {
        // Bloqueio rigoroso de 5 minutos (300 segundos) ao receber 429
        const waitTime = 300
        localStorage.setItem(
          `fp_block_${email}`,
          (Date.now() + waitTime * 1000).toString(),
        )
        startCooldown(waitTime)

        toast({
          variant: 'destructive',
          title: 'Limite excedido',
          description: `Muitas solicitações. Por segurança, aguarde ${formatTime(waitTime)} para tentar novamente.`,
        })
      } else if (
        msg.includes('timeout') ||
        msg.includes('gateway') ||
        error?.status === 504
      ) {
        setSmtpError(true)
        toast({
          variant: 'destructive',
          title: 'Erro de conexão',
          description:
            'O servidor demorou muito para responder. Tente novamente mais tarde.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao enviar e-mail',
          description:
            error?.message || 'Falha desconhecida. Tente novamente mais tarde.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    if (countdown > 0) {
      toast({
        variant: 'destructive',
        title: 'Aguarde',
        description: `Por favor, aguarde ${formatTime(countdown)} antes de tentar novamente.`,
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
                    {countdown > 0 ? (
                      <span className="flex items-center">
                        <Timer className="mr-2 h-4 w-4" />
                        Aguarde {formatTime(countdown)} para tentar novamente
                      </span>
                    ) : (
                      'Não recebi. Tentar novamente'
                    )}
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
                    className="w-full transition-all"
                    disabled={isLoading || countdown > 0}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : countdown > 0 ? (
                      <Timer className="mr-2 h-4 w-4 animate-pulse" />
                    ) : null}
                    {countdown > 0
                      ? `Aguarde ${formatTime(countdown)}`
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
