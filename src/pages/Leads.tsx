import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLeads, Lead } from '@/contexts/LeadsContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLogs } from '@/contexts/LogsContext'
import { useTemplates } from '@/contexts/TemplatesContext'
import { useWhatsApp } from '@/contexts/WhatsAppContext'
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
  const { waTemplates } = useWhatsApp()
  const { user } = useAuth()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const [emailDialogLead, setEmailDialogLead] = useState<Lead | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const [waDialogLead, setWaDialogLead] = useState<Lead | null>(null)
  const [selectedWaTemplate, setSelectedWaTemplate] = useState('')

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

  const selectedWaObj = waTemplates.find((t) => t.id === selectedWaTemplate)
  const previewWaBody =
    selectedWaObj?.text
      .replace(/{{lead_name}}/g, waDialogLead?.name || '')
      .replace(/{{company_name}}/g, waDialogLead?.company || '') || ''

  return (
    <div className="flex flex-col gap-6 print:gap-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Leads
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus leads e oportunidades de vendas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.print()}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild className="flex-1 md:flex-none">
            <Link to="/leads/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou empresa..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
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
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais Recentes</SelectItem>
              <SelectItem value="score">Maior Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto print:border-none print:shadow-none -mx-4 sm:mx-0">
        <div className="min-w-[800px] p-0">
          <Table className="print:text-xs">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-4 sm:pl-6">Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="print:hidden">Contatos Rápidos</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-[50px] print:hidden pr-4 sm:pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeads.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Nenhum lead encontrado com os filtros atuais.
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
                    <TableRow key={lead.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium pl-4 sm:pl-6">
                        {lead.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.company}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            statusColors[
                              lead.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={scoreColor}>
                          {score} pts
                        </Badge>
                      </TableCell>
                      <TableCell className="print:hidden">
                        <div className="flex items-center gap-3">
                          {lead.phone ? (
                            <button
                              onClick={() => setWaDialogLead(lead)}
                              className="h-8 w-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                              title="Enviar WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="w-8 h-8" />
                          )}
                          <button
                            onClick={() => setEmailDialogLead(lead)}
                            className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                            title="Enviar E-mail"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {lead.value
                          ? new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(lead.value)
                          : '-'}
                      </TableCell>
                      <TableCell className="print:hidden pr-4 sm:pr-6">
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
                                Editar Lead
                              </Link>
                            </DropdownMenuItem>
                            {user?.role === 'Admin' && (
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
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
      </div>

      <Dialog
        open={!!emailDialogLead}
        onOpenChange={(open) => !open && setEmailDialogLead(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar E-mail</DialogTitle>
            <DialogDescription>
              Selecione um modelo para {emailDialogLead?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplateObj && (
              <div className="space-y-3">
                <Input
                  readOnly
                  value={previewSubject}
                  className="bg-muted/50"
                />
                <Textarea
                  className="min-h-[150px] bg-muted/50"
                  readOnly
                  value={previewBody}
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setEmailDialogLead(null)}
            >
              Cancelar
            </Button>
            <Button
              disabled={!selectedTemplateObj}
              className="w-full sm:w-auto"
              asChild
            >
              <a
                href={`mailto:${emailDialogLead?.email}?subject=${encodeURIComponent(previewSubject)}&body=${encodeURIComponent(previewBody)}`}
              >
                Abrir Cliente de E-mail
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!waDialogLead}
        onOpenChange={(open) => !open && setWaDialogLead(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar WhatsApp</DialogTitle>
            <DialogDescription>
              Selecione um modelo para {waDialogLead?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={selectedWaTemplate}
              onValueChange={setSelectedWaTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo..." />
              </SelectTrigger>
              <SelectContent>
                {waTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedWaObj && (
              <Textarea
                className="min-h-[150px] bg-muted/50"
                readOnly
                value={previewWaBody}
              />
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setWaDialogLead(null)}
            >
              Cancelar
            </Button>
            <Button
              disabled={!selectedWaObj}
              className="w-full sm:w-auto"
              asChild
            >
              <a
                href={`https://wa.me/${waDialogLead?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(previewWaBody)}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir WhatsApp Web
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
