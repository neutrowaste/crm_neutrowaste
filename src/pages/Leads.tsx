import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLeads } from '@/contexts/LeadsContext'
import { useAuth } from '@/contexts/AuthContext'
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
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusColors = {
  Novo: 'bg-blue-100 text-blue-800',
  Contatado: 'bg-yellow-100 text-yellow-800',
  Qualificado: 'bg-purple-100 text-purple-800',
  Proposta: 'bg-orange-100 text-orange-800',
  Ganho: 'bg-green-100 text-green-800',
}

export default function Leads() {
  const { leads, removeLead } = useLeads()
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  const handleDelete = (id: string) => {
    removeLead(id)
    toast({
      title: 'Lead excluído',
      description: 'Lead excluído com sucesso.',
    })
  }

  const exportCSV = () => {
    const headers = [
      'Nome',
      'Empresa',
      'E-mail',
      'Telefone',
      'Status',
      'Origem',
      'Valor',
      'Data de Criação',
    ]
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map((l) =>
        [
          `"${l.name}"`,
          `"${l.company}"`,
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
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'leads_neutrowaste.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPDF = () => {
    window.print()
  }

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
                Exportar Dados
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar para PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportCSV}>
                <TableIcon className="mr-2 h-4 w-4" />
                Exportar para Excel (CSV)
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

      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold">Relatório de Leads - Neutrowaste</h1>
        <p className="text-sm text-gray-500">
          Gerado em: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou empresa..."
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
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Origens</SelectItem>
              <SelectItem value="Site">Site</SelectItem>
              <SelectItem value="Indicação">Indicação</SelectItem>
              <SelectItem value="Ligação">Ligação</SelectItem>
              <SelectItem value="Evento">Evento</SelectItem>
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
              <TableHead className="print:hidden">Ações de Contato</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[50px] print:hidden">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
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
                  <TableCell className="print:hidden">
                    <div className="flex items-center gap-3">
                      {lead.phone ? (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="w-4 h-4" />
                      )}
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Enviar E-mail"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
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
                            onClick={() => handleDelete(lead.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
