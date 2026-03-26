import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useLeads } from '@/contexts/LeadsContext'
import { useLogs } from '@/contexts/LogsContext'
import { useAuth } from '@/contexts/AuthContext'
import { useContracts, ContractStatus } from '@/contexts/ContractsContext'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  MoreHorizontal,
  UploadCloud,
  FileSignature,
  CheckCircle,
  XCircle,
  Download,
  Trash,
  Link2,
} from 'lucide-react'

const leadSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Endereço de e-mail inválido.'),
  phone: z.string().optional(),
  company: z
    .string()
    .min(2, 'O nome da empresa deve ter pelo menos 2 caracteres.'),
  status: z.enum(['Novo', 'Contatado', 'Qualificado', 'Proposta', 'Ganho']),
  source: z.enum(['Site', 'Indicação', 'Ligação', 'Evento']),
  value: z.coerce.number().min(0).optional(),
  assignedTo: z.string().optional(),
})

const contractStatusColors: Record<ContractStatus, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  'Sent for Signature': 'bg-blue-100 text-blue-800',
  Signed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
}

export default function EditLead() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const { leads, updateLead } = useLeads()
  const { logs, addLog } = useLogs()
  const { user, allUsers } = useAuth()
  const { contracts, addContract, updateContractStatus, deleteContract } =
    useContracts()

  const defaultTab = searchParams.get('tab') || 'details'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [newContractName, setNewContractName] = useState('')

  const lead = leads.find((l) => l.id === id)
  const leadContracts = contracts.filter((c) => c.leadId === id)

  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead ? { ...lead } : undefined,
  })

  if (!lead) return <div className="p-8">Lead não encontrado.</div>

  const onSubmit = async (data: z.infer<typeof leadSchema>) => {
    await updateLead(id!, data)
    if (user) {
      await addLog({
        userId: user.id,
        userName: user.name,
        action: 'Atualizar',
        leadId: lead.id,
        leadName: lead.name,
        details: 'Informações do lead atualizadas',
      })
    }
    toast({ title: 'Sucesso', description: 'Lead atualizado com sucesso!' })
  }

  const handleUploadContract = async () => {
    if (!newContractName.trim() || !user) return

    await addContract({
      leadId: lead.id,
      name: newContractName,
      status: 'Draft',
      uploadedBy: user.id,
      uploadedByName: user.name,
      fileUrl: '#',
    })

    await addLog({
      userId: user.id,
      userName: user.name,
      action: 'Criar',
      leadId: lead.id,
      leadName: lead.name,
      details: `Novo contrato criado em rascunho: ${newContractName}`,
    })

    toast({ title: 'Sucesso', description: 'Contrato salvo com sucesso.' })
    setNewContractName('')
    setIsUploadOpen(false)
  }

  const handleStatusChange = async (
    contractId: string,
    status: ContractStatus,
    contractName: string,
  ) => {
    if (!user) return
    await updateContractStatus(contractId, status)

    await addLog({
      userId: user.id,
      userName: user.name,
      action: 'Atualizar',
      leadId: lead.id,
      leadName: lead.name,
      details: `Status do contrato "${contractName}" alterado para ${status}`,
    })

    if (status === 'Sent for Signature') {
      const portalLink = `${window.location.origin}/portal/${contractId}`
      const emailBody = `Olá ${lead.name},\n\nO documento "${contractName}" da empresa ${lead.company} está pronto para sua assinatura.\n\nAcesse o portal seguro para revisar e assinar: ${portalLink}`

      await addLog({
        userId: 'system',
        userName: 'Sistema Automático',
        action: 'Email Enviado',
        leadId: lead.id,
        leadName: lead.name,
        details: `E-mail automático enviado para ${lead.email}.\nConteúdo:\n${emailBody}`,
      })

      toast({
        title: 'Documento Enviado!',
        description:
          'O link de assinatura do portal foi enviado ao cliente por e-mail.',
      })
    } else if (status === 'Signed' && lead.status !== 'Ganho') {
      await updateLead(lead.id, { status: 'Ganho' })
      await addLog({
        userId: user.id,
        userName: user.name,
        action: 'Atualizar',
        leadId: lead.id,
        leadName: lead.name,
        details: 'Lead atualizado para Ganho (Contrato assinado manualmente)',
      })
      toast({
        title: 'Contrato Assinado!',
        description: 'O status do lead foi atualizado para Ganho.',
      })
    } else {
      toast({
        title: 'Status Atualizado',
        description: 'O status do contrato foi atualizado.',
      })
    }
  }

  const handleDeleteContract = async (
    contractId: string,
    contractName: string,
  ) => {
    if (!user) return
    await deleteContract(contractId)
    await addLog({
      userId: user.id,
      userName: user.name,
      action: 'Excluir',
      leadId: lead.id,
      leadName: lead.name,
      details: `Contrato excluído: ${contractName}`,
    })
    toast({
      title: 'Contrato Excluído',
      description: 'O documento foi removido.',
    })
  }

  const leadLogs = logs
    .filter((l) => l.leadId === id)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Editar Lead
          </h1>
          <p className="text-muted-foreground mt-1">
            {lead.name} - {lead.company}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <TabsList className="flex w-max sm:w-full max-w-[500px]">
            <TabsTrigger value="details" className="flex-1">
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex-1">
              Contratos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              Logs e Histórico
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                          <Input type="email" {...field} />
                        </FormControl>
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
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status no Funil</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Novo">Novo</SelectItem>
                            <SelectItem value="Contatado">Contatado</SelectItem>
                            <SelectItem value="Qualificado">
                              Qualificado
                            </SelectItem>
                            <SelectItem value="Proposta">Proposta</SelectItem>
                            <SelectItem value="Ganho">Ganho</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Estimado (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Vendedor Responsável</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um Vendedor" />
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
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Gestão de Contratos</CardTitle>
                <CardDescription>
                  Documentos, portal e envio para assinatura digital.
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsUploadOpen(true)}
                className="w-full sm:w-auto"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Novo Contrato
              </Button>
            </CardHeader>
            <CardContent>
              {leadContracts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <FileSignature className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum contrato criado ainda.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto -mx-6 sm:mx-0">
                  <div className="min-w-[700px] px-6 sm:px-0">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Nome do Documento</TableHead>
                          <TableHead>Enviado por</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leadContracts.map((contract) => (
                          <TableRow key={contract.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {contract.name}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {contract.uploadedByName}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {format(
                                new Date(contract.createdAt),
                                'dd/MM/yyyy',
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  contractStatusColors[contract.status]
                                }
                                variant="secondary"
                              >
                                {contract.status === 'Sent for Signature'
                                  ? 'Aguardando Assinatura'
                                  : contract.status === 'Draft'
                                    ? 'Rascunho'
                                    : contract.status === 'Signed'
                                      ? 'Assinado'
                                      : 'Rejeitado'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `${window.location.origin}/portal/${contract.id}`,
                                      )
                                      toast({
                                        description:
                                          'Link do portal copiado para a área de transferência.',
                                      })
                                    }}
                                  >
                                    <Link2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                    Copiar Link do Portal
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toast({
                                        description:
                                          'Download simulado com sucesso.',
                                      })
                                    }
                                  >
                                    <Download className="w-4 h-4 mr-2 text-muted-foreground" />{' '}
                                    Download PDF
                                  </DropdownMenuItem>

                                  {contract.status === 'Draft' && (
                                    <DropdownMenuItem
                                      className="text-blue-600 focus:text-blue-600"
                                      onClick={() =>
                                        handleStatusChange(
                                          contract.id,
                                          'Sent for Signature',
                                          contract.name,
                                        )
                                      }
                                    >
                                      <FileSignature className="w-4 h-4 mr-2" />
                                      Enviar para Assinatura
                                    </DropdownMenuItem>
                                  )}

                                  {contract.status === 'Sent for Signature' && (
                                    <>
                                      <DropdownMenuItem
                                        className="text-green-600 focus:text-green-600"
                                        onClick={() =>
                                          handleStatusChange(
                                            contract.id,
                                            'Signed',
                                            contract.name,
                                          )
                                        }
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Assinatura Manual
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-orange-600 focus:text-orange-600"
                                        onClick={() =>
                                          handleStatusChange(
                                            contract.id,
                                            'Rejected',
                                            contract.name,
                                          )
                                        }
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Marcar como Rejeitado
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {(user?.role === 'Admin' ||
                                    user?.id === contract.uploadedBy) && (
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() =>
                                        handleDeleteContract(
                                          contract.id,
                                          contract.name,
                                        )
                                      }
                                    >
                                      <Trash className="w-4 h-4 mr-2" />
                                      Excluir Documento
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria do Lead</CardTitle>
              <CardDescription>
                Registro completo de interações, e-mails automáticos e acessos
                ao portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leadLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Nenhuma atividade registrada.
                </p>
              ) : (
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <div className="min-w-[600px] px-6 sm:px-0">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[140px]">
                            Data / Hora
                          </TableHead>
                          <TableHead className="w-[150px]">Usuário</TableHead>
                          <TableHead className="w-[150px]">Ação</TableHead>
                          <TableHead>Detalhes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leadLogs.map((log) => (
                          <TableRow key={log.id} className="hover:bg-muted/30">
                            <TableCell className="whitespace-nowrap align-top text-muted-foreground">
                              {format(
                                new Date(log.timestamp),
                                'dd/MM/yyyy HH:mm',
                                {
                                  locale: ptBR,
                                },
                              )}
                            </TableCell>
                            <TableCell className="align-top font-medium">
                              {log.userName}
                            </TableCell>
                            <TableCell className="align-top">
                              <Badge
                                variant="outline"
                                className={
                                  log.action === 'Email Enviado' ||
                                  log.action === 'E-mail Automático'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : log.action === 'Assinatura' ||
                                        log.action === 'Atualizar'
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : log.action === 'Acesso ao Portal'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-muted text-muted-foreground border-border'
                                }
                              >
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-pre-line text-sm max-w-md">
                              {log.details}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Anexar Novo Contrato</DialogTitle>
            <DialogDescription>
              Faça o upload do documento que será disponibilizado no Portal do
              Cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Documento</label>
              <Input
                placeholder="Ex: Contrato de Prestação de Serviços"
                value={newContractName}
                onChange={(e) => setNewContractName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Arquivo PDF</label>
              <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar ou arraste o arquivo aqui.
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  id="file-upload"
                  onChange={() => {
                    if (!newContractName)
                      setNewContractName('Novo Contrato.pdf')
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="absolute inset-0 cursor-pointer"
                ></label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleUploadContract}
              disabled={!newContractName}
            >
              Salvar Rascunho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
