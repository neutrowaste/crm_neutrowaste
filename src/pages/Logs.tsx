import { useState } from 'react'
import { useLogs } from '@/contexts/LogsContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ShieldAlert, Search } from 'lucide-react'

export default function Logs() {
  const { logs } = useLogs()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  if (user?.role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  const filteredLogs = logs
    .filter(
      (log) =>
        log.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Logs de Auditoria
          </h1>
          <p className="text-muted-foreground mt-1">
            Rastreabilidade completa: histórico de alterações, gatilhos
            automáticos e acessos.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div className="space-y-1">
            <CardTitle>Registro de Atividades</CardTitle>
            <CardDescription>
              Visualizando {filteredLogs.length} registros no sistema.
            </CardDescription>
          </div>
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuário, ação ou lead..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[160px]">Data/Hora</TableHead>
                  <TableHead className="w-[180px]">Usuário</TableHead>
                  <TableHead className="w-[160px]">Ação</TableHead>
                  <TableHead className="w-[200px]">Entidade / Lead</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Nenhum registro de auditoria encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30">
                      <TableCell className="whitespace-nowrap align-top font-medium text-muted-foreground">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="align-top font-medium">
                        {log.userName}
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell
                        className="align-top font-medium truncate max-w-[200px]"
                        title={log.leadName}
                      >
                        {log.leadName}
                      </TableCell>
                      <TableCell className="align-top text-muted-foreground max-w-md whitespace-pre-wrap text-sm">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
