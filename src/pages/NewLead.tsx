import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useLeads } from '@/contexts/LeadsContext'
import { useLogs } from '@/contexts/LogsContext'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const leadSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Endereço de e-mail inválido.'),
  phone: z.string().optional(),
  company: z
    .string()
    .min(2, 'O nome da empresa deve ter pelo menos 2 caracteres.'),
  industry: z.string().optional(),
  status: z.enum(['Novo', 'Contatado', 'Qualificado', 'Proposta', 'Ganho']),
  source: z.enum(['Site', 'Indicação', 'Ligação', 'Evento']),
  value: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
})

type LeadFormValues = z.infer<typeof leadSchema>

export default function NewLead() {
  const { addLead } = useLeads()
  const { addLog } = useLogs()
  const { user, allUsers } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: '',
      status: 'Novo',
      source: 'Site',
      notes: '',
      assignedTo: user?.id || '',
    },
  })

  const onSubmit = async (data: LeadFormValues) => {
    try {
      const newId = await addLead(data)
      if (user) {
        await addLog({
          userId: user.id,
          userName: user.name,
          action: 'Criar',
          leadId: newId,
          leadName: data.name,
          details: 'Lead cadastrado no sistema',
        })
      }
      toast({ title: 'Sucesso!', description: 'Lead cadastrado com sucesso!' })
      navigate('/leads')
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Cadastrar Novo Lead
        </h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="joao@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Empresa S/A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Lead</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Novo">Novo</SelectItem>
                        <SelectItem value="Contatado">Contatado</SelectItem>
                        <SelectItem value="Qualificado">Qualificado</SelectItem>
                        <SelectItem value="Proposta">Proposta</SelectItem>
                        <SelectItem value="Ganho">Ganho</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Site">Site</SelectItem>
                        <SelectItem value="Indicação">Indicação</SelectItem>
                        <SelectItem value="Ligação">Ligação</SelectItem>
                        <SelectItem value="Evento">Evento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Esperado (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atribuído a</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o Vendedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate('/leads')}
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
