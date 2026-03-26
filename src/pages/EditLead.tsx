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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  const onSubmit = (data: z.infer<typeof leadSchema>) => {
    updateLead(id!, data)
    if (user) {
      addLog({
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

  const handleUploadContract = () => {
    if (!newContractName.trim() || !user) return

    addContract({
      leadId: lead.id,
      name: newContractName,
      status: 'Draft',
      uploadedBy: user.id,
      uploadedByName: user.name,
      fileUrl: '#',
    })

    addLog({
      userId: user.id,
      userName: user.name,
      action: 'Criar',
      leadId: lead.id,
      leadName: lead.name,
      details: `Novo contrato enviado: ${newContractName}`,
    })

    toast({ title: 'Sucesso', description: 'Contrato salvo com sucesso.' })
    setNewContractName('')
    setIsUploadOpen(false)
  }

  const handleStatusChange = (
    contractId: string,
    status: ContractStatus,
    contractName: string,
  ) => {
    if (!user) return
    updateContractStatus(contractId, status)

    addLog({
      userId: user.id,
      userName: user.name,
      action: 'Atualizar',
      leadId: lead.id,
      leadName: lead.name,
      details: `Status do contrato "${contractName}" alterado para ${status}`,
    })

    // Auto update lead status if contract is signed
    if (status === 'Signed' && lead.status !== 'Ganho') {
      updateLead(lead.id, { status: 'Ganho' })
      addLog({
        userId: user.id,
        userName: user.name,
        action: 'Atualizar',
        leadId: lead.id,
        leadName: lead.name,
        details: 'Lead atualizado para Ganho (Contrato assinado)',
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

  const handleDeleteContract = (contractId: string, contractName: string) => {
    if (!user) return
    deleteContract(contractId)
    addLog({
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Editar Lead
        </h1>
        <p className="text-muted-foreground">
          {lead.name} - {lead.company}
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
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
                        <FormLabel>Status</FormLabel>
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
                        <FormLabel>Valor (R$)</FormLabel>
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
                      <FormItem>
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
              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/leads')}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestão de Contratos</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Documentos e propostas associados a este lead.
                </p>
              </div>
              <Button onClick={() => setIsUploadOpen(true)}>
                <UploadCloud className="w-4 h-4 mr-2" />
                Novo Contrato
              </Button>
            </CardHeader>
            <CardContent>
              {leadContracts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileSignature className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum contrato enviado ainda.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
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
                        <TableCell className="font-medium">
                          {contract.name}
                        </TableCell>
                        <TableCell>{contract.uploadedByName}</TableCell>
                        <TableCell>
                          {format(new Date(contract.createdAt), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={contractStatusColors[contract.status]}
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
                                onClick={() =>
                                  toast({
                                    description:
                                      'Download simulado com sucesso.',
                                  })
                                }
                              >
                                <Download className="w-4 h-4 mr-2" /> Download
                              </DropdownMenuItem>

                              {contract.status === 'Draft' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(
                                      contract.id,
                                      'Sent for Signature',
                                      contract.name,
                                    )
                                  }
                                >
                                  <FileSignature className="w-4 h-4 mr-2" />
                                  Solicitar Assinatura
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
                                    Marcar como Assinado
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
                                  Excluir
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              {leadLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma atividade registrada.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>{log.userName}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Novo Contrato</DialogTitle>
            <DialogDescription>
              Faça o upload do documento em PDF associado a este lead.
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUploadContract} disabled={!newContractName}>
              Salvar Contrato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
