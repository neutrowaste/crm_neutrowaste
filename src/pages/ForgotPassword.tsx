import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import logoImg from '../assets/neutrowaste-0b9d5.jpg'
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react'

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido.'),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPassword() {
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
    // Simulate API call
    setTimeout(() => {
      setSubmittedEmail(data.email)
      setIsSuccess(true)
      setIsLoading(false)
    }, 1500)
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
            Recuperar senha
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Reset your password
            </CardTitle>
            {!isSuccess && (
              <CardDescription className="text-center text-sm pt-2">
                Enter your email address and we'll send you a link to reset your
                password.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
                <div className="rounded-full bg-green-100 p-3">
                  <MailCheck className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Check your email. If an account exists for{' '}
                  <span className="font-medium text-gray-900">
                    {submittedEmail}
                  </span>
                  , you will receive a password reset link shortly.
                </p>
                <div className="pt-4 w-full">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Link>
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
                        <FormLabel>Email address</FormLabel>
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
                    Send reset link
                  </Button>
                  <div className="mt-6 text-center text-sm">
                    <Link
                      to="/login"
                      className="font-medium text-primary hover:underline inline-flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-3 w-3" />
                      Back to login
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
