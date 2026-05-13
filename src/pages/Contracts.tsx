import { useContracts } from '@/contexts/ContractsContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { FileText, Loader2, Calendar, Phone, User, Clock } from 'lucide-react'
import { AddContractDialog } from '@/components/AddContractDialog'
import { differenceInDays, parseISO, format } from 'date-fns'
import { cn } from '@/lib/utils'

const calculateRemainingDays = (endDate: string | null) => {
  if (!endDate) return null
  return differenceInDays(parseISO(endDate), new Date())
}

const formatDisplayDate = (dateString: string | null) => {
  if (!dateString) return null
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy')
  } catch (e) {
    return dateString
  }
}

export default function ContractsPage() {
  const { contracts, isLoading } = useContracts()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os contratos e documentos dos seus leads.
          </p>
        </div>
        <AddContractDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contracts.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground border rounded-lg bg-card">
            Nenhum contrato encontrado.
          </div>
        ) : (
          contracts.map((contract) => (
            <Card key={contract.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle
                    className="text-base truncate"
                    title={contract.name}
                  >
                    {contract.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground truncate">
                    {contract.leads?.name || 'Lead não encontrado'}{' '}
                    {contract.leads?.company
                      ? `(${contract.leads.company})`
                      : ''}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium bg-secondary px-2 py-0.5 rounded-full text-xs">
                    {contract.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 flex-1 w-full">
                    {contract.data_inicio && (
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Início
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {formatDisplayDate(contract.data_inicio)}
                          </span>
                        </div>
                      </div>
                    )}
                    {contract.data_termino && (
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Término
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {formatDisplayDate(contract.data_termino)}
                          </span>
                        </div>
                      </div>
                    )}
                    {contract.vigencia && (
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Vigência
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {contract.vigencia} meses
                          </span>
                        </div>
                      </div>
                    )}
                    {contract.nome_gestor && (
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Gestor
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span
                            className="truncate"
                            title={contract.nome_gestor}
                          >
                            {contract.nome_gestor}
                          </span>
                        </div>
                      </div>
                    )}
                    {contract.telefone_gestor && (
                      <div className="flex flex-col space-y-1 col-span-2 sm:col-span-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Telefone
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {contract.telefone_gestor}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {contract.data_termino && (
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 w-full sm:w-auto shrink-0 bg-secondary/20 sm:bg-transparent p-3 sm:p-0 rounded-md sm:rounded-none">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0 sm:mb-1 flex items-center gap-1">
                        Prazo Restante
                      </span>
                      {(() => {
                        const days = calculateRemainingDays(
                          contract.data_termino,
                        )
                        if (days === null) return null
                        const isExpiringSoon = days <= 30
                        return (
                          <span
                            className={cn(
                              'text-lg sm:text-base font-bold',
                              isExpiringSoon
                                ? 'text-red-600 dark:text-red-500'
                                : 'text-green-600 dark:text-green-500',
                            )}
                          >
                            {days > 0
                              ? `${days} dias`
                              : days === 0
                                ? 'Vence hoje'
                                : `${Math.abs(days)} dias`}
                          </span>
                        )
                      })()}
                    </div>
                  )}
                </div>{' '}
              </CardContent>
              {contract.file_url && (
                <CardFooter className="pt-0">
                  <a
                    href={contract.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 w-full justify-center border border-primary/20 bg-primary/5 py-2 rounded-md transition-colors hover:bg-primary/10"
                  >
                    <FileText className="h-4 w-4" />
                    Visualizar Documento
                  </a>
                </CardFooter>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
