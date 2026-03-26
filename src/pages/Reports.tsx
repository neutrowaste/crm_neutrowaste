import { useState, useEffect } from 'react'
import { Metrics } from '@/components/dashboard/Metrics'
import { ContractsChart } from '@/components/dashboard/ContractsChart'
import { SalesFunnel } from '@/components/dashboard/SalesFunnel'
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
}

export default function Reports() {
  const { toast } = useToast()
  const [timeFilter, setTimeFilter] = useState('monthly')
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
    }
  }

  const handleSaveReportGroup = () => {
    if (!reportName.trim()) return

    const newReport: SavedReport = {
      id: Math.random().toString(36).substr(2, 9),
      name: reportName,
      timeFilter,
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
    toast({
      description: `Configuração "${report.name}" carregada.`,
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Relatórios e Análises
          </h1>
          <p className="text-muted-foreground">
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
                  className="border-primary/20 text-primary"
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

          <Button variant="outline" onClick={() => setIsSaveDialogOpen(true)}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Visão
          </Button>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Exportar
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

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 print:text-black">
            Indicadores Chave de Performance (KPIs)
          </h2>
          <Metrics timeFilter={timeFilter} />
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground print:text-black">
              Evolução de Assinaturas
            </h2>
            <ContractsChart timeFilter={timeFilter} />
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground print:text-black">
              Funil de Vendas
            </h2>
            <SalesFunnel timeFilter={timeFilter} />
          </div>
        </section>
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
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
              Filtro atual:{' '}
              {timeFilter === 'monthly'
                ? 'Mensal'
                : timeFilter === 'weekly'
                  ? 'Semanal'
                  : 'Trimestral'}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
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
