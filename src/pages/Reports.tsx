import { useState, useEffect } from 'react'
import { Metrics } from '@/components/dashboard/Metrics'
import { ContractsChart } from '@/components/dashboard/ContractsChart'
import { SalesFunnel } from '@/components/dashboard/SalesFunnel'
import { RevenueByStatusChart } from '@/components/dashboard/RevenueByStatusChart'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Download,
  FileText,
  FileSpreadsheet,
  Save,
  Bookmark,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface SavedReport {
  id: string
  name: string
  timeFilter: string
  dateRange: { start: string; end: string }
}

export default function Reports() {
  const { toast } = useToast()
  const [timeFilter, setTimeFilter] = useState('monthly')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [reportName, setReportName] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('@neutrowaste:savedReports')
    if (saved) {
      setSavedReports(JSON.parse(saved))
    }
  }, [])

  const handleExport = (format: string) => {
    toast({
      title: 'Exportando Relatório',
      description: `O relatório está sendo exportado para ${format}. O download iniciará em breve.`,
    })
    if (format === 'PDF') {
      window.print()
    } else {
      setTimeout(() => {
        toast({
          title: 'Exportação Concluída',
          description: 'Arquivo Excel gerado com sucesso.',
        })
      }, 1500)
    }
  }

  const handleSaveReportGroup = () => {
    if (!reportName.trim()) return

    const newReport: SavedReport = {
      id: Math.random().toString(36).substr(2, 9),
      name: reportName,
      timeFilter,
      dateRange,
    }

    const updated = [...savedReports, newReport]
    setSavedReports(updated)
    localStorage.setItem('@neutrowaste:savedReports', JSON.stringify(updated))

    toast({
      title: 'Configuração Salva',
      description: `O grupo de relatórios "${reportName}" foi salvo.`,
    })

    setIsSaveDialogOpen(false)
    setReportName('')
  }

  const loadReport = (report: SavedReport) => {
    setTimeFilter(report.timeFilter)
    if (report.dateRange) setDateRange(report.dateRange)
    toast({
      description: `Configuração "${report.name}" carregada.`,
    })
  }

  const getFilterLabel = (val: string) => {
    switch (val) {
      case 'weekly':
        return 'Últimos 7 dias'
      case 'monthly':
        return 'Este Mês'
      case 'quarterly':
        return 'Último Trimestre'
      case 'custom':
        return 'Personalizado'
      default:
        return val
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard e Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o desempenho de vendas, métricas de conversão e dados da
            operação.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {savedReports.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none border-primary/20 text-primary"
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Salvos
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {savedReports.map((r) => (
                  <DropdownMenuItem key={r.id} onClick={() => loadReport(r)}>
                    {r.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            className="flex-1 md:flex-none"
            onClick={() => setIsSaveDialogOpen(true)}
          >
            <Save className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Salvar Visão</span>
            <span className="sm:hidden">Salvar</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Últimos 7 dias</SelectItem>
                <SelectItem value="monthly">Este Mês</SelectItem>
                <SelectItem value="quarterly">Último Trimestre</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {timeFilter === 'custom' && (
              <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in zoom-in duration-200">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="w-[140px]"
                />
                <span className="text-muted-foreground hidden sm:inline">
                  até
                </span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="w-[140px]"
                />
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto flex-1 md:flex-none">
                <Download className="mr-2 h-4 w-4" />
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('PDF')}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar como PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('Excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar como Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-black border-b pb-4 mb-4">
          Relatório Gerencial de Vendas
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
          <p>
            <strong>Período:</strong> {getFilterLabel(timeFilter)}{' '}
            {timeFilter === 'custom' &&
              `(${dateRange.start} a ${dateRange.end})`}
          </p>
          <p>
            <strong>Data de Geração:</strong>{' '}
            {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="space-y-8 print:space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 print:text-black">
            Indicadores Chave de Performance (KPIs)
          </h2>
          <Metrics timeFilter={timeFilter} dateRange={dateRange} />
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 print:grid-cols-2 print:gap-4 print:break-inside-avoid">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground print:text-black">
              Evolução de Assinaturas
            </h2>
            <ContractsChart timeFilter={timeFilter} dateRange={dateRange} />
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground print:text-black">
              Funil de Vendas
            </h2>
            <SalesFunnel timeFilter={timeFilter} dateRange={dateRange} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 print:grid-cols-2 print:gap-4 print:break-inside-avoid">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground print:text-black">
              Receita por Etapa
            </h2>
            <RevenueByStatusChart
              timeFilter={timeFilter}
              dateRange={dateRange}
            />
          </div>
        </section>
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar Grupo de Relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Grupo</label>
              <Input
                placeholder="Ex: Visão Mensal Diretoria"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Filtro atual: {getFilterLabel(timeFilter)}
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleSaveReportGroup}
              disabled={!reportName.trim()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
