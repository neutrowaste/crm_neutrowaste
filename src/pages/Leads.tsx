import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLeads, Lead } from '@/contexts/LeadsContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLogs } from '@/contexts/LogsContext'
import { useTemplates } from '@/contexts/TemplatesContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  MessageCircle,
  Mail,
  Download,
  FileText,
  Table as TableIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { calculateLeadScore } from '@/lib/utils'

const statusColors = {
  Novo: 'bg-blue-100 text-blue-800',
  Contatado: 'bg-yellow-100 text-yellow-800',
  Qualificado: 'bg-purple-100 text-purple-800',
  Proposta: 'bg-orange-100 text-orange-800',
  Ganho: 'bg-green-100 text-green-800',
}

export default function Leads() {
  const { leads, removeLead } = useLeads()
  const { addLog } = useLogs()
  const { templates } = useTemplates()
  const { user } = useAuth()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [emailDialogLead, setEmailDialogLead] = useState<Lead | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const sortedLeads = useMemo(() => {
    let filtered = leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || lead.status === statusFilter
      return matchesSearch && matchesStatus
    })

    return filtered.sort((a, b) => {
      if (sortBy === 'score')
        return calculateLeadScore(b) - calculateLeadScore(a)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [leads, searchTerm, statusFilter, sortBy])

  const handleDelete = (lead: Lead) => {
    removeLead(lead.id)
    if (user) {
      addLog({
        userId: user.id,
        userName: user.name,
        action: 'Excluir',
        leadId: lead.id,
        leadName: lead.name,
        details: 'Lead excluído do sistema',
      })
    }
    toast({ title: 'Lead excluído', description: 'Lead excluído com sucesso.' })
  }

  const exportCSV = () => {
    const headers = [
      'Nome',
      'Empresa',
      'Score',
      'E-mail',
      'Telefone',
      'Status',
      'Origem',
      'Valor',
      'Data de Criação',
    ]
    const csvContent = [
      headers.join(','),
      ...sortedLeads.map((l) =>
        [
          `"${l.name}"`,
          `"${l.company}"`,
          calculateLeadScore(l),
          `"${l.email}"`,
          `"${l.phone || ''}"`,
          `"${l.status}"`,
          `"${l.source}"`,
          l.value || 0,
          `"${format(new Date(l.createdAt), 'dd/MM/yyyy')}"`,
        ].join(','),
      ),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'leads.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const selectedTemplateObj = templates.find((t) => t.id === selectedTemplate)
  const previewSubject =
    selectedTemplateObj?.subject
      .replace(/{{company_name}}/g, emailDialogLead?.company || '')
      .replace(/{{contact_name}}/g, emailDialogLead?.name || '')
      .replace(/{{lead_value}}/g, emailDialogLead?.value?.toString() || '') ||
    ''
  const previewBody =
    selectedTemplateObj?.body
      .replace(/{{company_name}}/g, emailDialogLead?.company || '')
      .replace(/{{contact_name}}/g, emailDialogLead?.name || '')
      .replace(/{{lead_value}}/g, emailDialogLead?.value?.toString() || '') ||
    ''

  return (
    <div className="flex flex-col gap-6 print:gap-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Leads
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus leads e oportunidades de vendas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.print()}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportCSV}>
                <TableIcon className="mr-2 h-4 w-4" />
                Excel (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild>
            <Link to="/leads/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Novo">Novo</SelectItem>
              <SelectItem value="Contatado">Contatado</SelectItem>
              <SelectItem value="Qualificado">Qualificado</SelectItem>
              <SelectItem value="Proposta">Proposta</SelectItem>
              <SelectItem value="Ganho">Ganho</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais Recentes</SelectItem>
              <SelectItem value="score">Maior Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto print:border-none print:shadow-none">
        <Table className="print:text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="print:hidden">Contato</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[50px] print:hidden"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLeads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sortedLeads.map((lead) => {
                const score = calculateLeadScore(lead)
                const scoreColor =
                  score >= 70
                    ? 'bg-green-100 text-green-800'
                    : score >= 40
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'

                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          statusColors[lead.status as keyof typeof statusColors]
                        }
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={scoreColor}>
                        {score}
                      </Badge>
                    </TableCell>
                    <TableCell className="print:hidden">
                      <div className="flex items-center gap-3">
                        {lead.phone ? (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 hover:text-green-700 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="w-4 h-4" />
                        )}
                        <button
                          onClick={() => setEmailDialogLead(lead)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.value
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(lead.value)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(lead.createdAt), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="print:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/leads/edit/${lead.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          {user?.role === 'Admin' && (
                            <DropdownMenuItem
                              className="text-red-600 focus:bg-red-50 focus:text-red-600"
                              onClick={() => handleDelete(lead)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!emailDialogLead}
        onOpenChange={(open) => !open && setEmailDialogLead(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar E-mail</DialogTitle>
            <DialogDescription>
              Selecione um modelo de e-mail para enviar para{' '}
              {emailDialogLead?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Modelo</label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTemplateObj && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assunto</label>
                  <Input readOnly value={previewSubject} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Corpo</label>
                  <Textarea
                    className="min-h-[150px]"
                    readOnly
                    value={previewBody}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogLead(null)}>
              Cancelar
            </Button>
            <Button disabled={!selectedTemplateObj} asChild>
              <a
                href={`mailto:${emailDialogLead?.email}?subject=${encodeURIComponent(previewSubject)}&body=${encodeURIComponent(previewBody)}`}
              >
                Abrir Cliente de E-mail
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
