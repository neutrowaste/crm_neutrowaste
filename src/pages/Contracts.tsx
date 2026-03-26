import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useContracts } from '@/contexts/ContractsContext'
import { useLeads } from '@/contexts/LeadsContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, Search, FileSignature } from 'lucide-react'

const contractStatusColors = {
  Draft: 'bg-gray-100 text-gray-800',
  'Sent for Signature': 'bg-blue-100 text-blue-800',
  Signed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
}

const contractStatusLabels = {
  Draft: 'Rascunho',
  'Sent for Signature': 'Aguardando Assinatura',
  Signed: 'Assinado',
  Rejected: 'Rejeitado',
}

export default function ContractsPage() {
  const { contracts } = useContracts()
  const { leads } = useLeads()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  if (user?.role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  const filteredContracts = contracts
    .filter((c) => {
      const lead = leads.find((l) => l.id === c.leadId)
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead?.company.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Visão Global de Contratos
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitore todos os contratos e propostas da organização.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle>Todos os Documentos</CardTitle>
              <CardDescription>
                Filtre e busque por contratos enviados.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contrato ou lead..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Draft">Rascunho</SelectItem>
                  <SelectItem value="Sent for Signature">
                    Aguardando Assinatura
                  </SelectItem>
                  <SelectItem value="Signed">Assinado</SelectItem>
                  <SelectItem value="Rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto -mx-6 sm:mx-0">
            <div className="min-w-[800px] px-6 sm:px-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Lead Associado</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Data de Atualização</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <FileSignature className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        Nenhum contrato encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContracts.map((contract) => {
                      const lead = leads.find((l) => l.id === contract.leadId)
                      return (
                        <TableRow
                          key={contract.id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="font-medium whitespace-nowrap">
                            {contract.name}
                          </TableCell>
                          <TableCell>
                            {lead ? (
                              <div className="flex flex-col">
                                <span className="font-medium">{lead.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {lead.company}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Lead removido
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {contract.uploadedByName}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {format(
                              new Date(contract.updatedAt),
                              'dd MMM yyyy, HH:mm',
                              { locale: ptBR },
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={contractStatusColors[contract.status]}
                              variant="secondary"
                            >
                              {contractStatusLabels[contract.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                to={`/leads/edit/${contract.leadId}?tab=contracts`}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
