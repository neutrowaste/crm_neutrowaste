import { useState } from 'react'
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
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Reports() {
  const { toast } = useToast()
  const [timeFilter, setTimeFilter] = useState('monthly')

  const handleExport = (format: string) => {
    toast({
      title: 'Exportando Relatório',
      description: `O relatório está sendo exportado para ${format}. O download iniciará em breve.`,
    })
    if (format === 'PDF') {
      window.print()
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Relatórios e Análises
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho de vendas, métricas de conversão e dados da
            operação.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4 print:text-black">
            Indicadores Chave de Performance (KPIs)
          </h2>
          <Metrics timeFilter={timeFilter} />
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 print:text-black">
              Evolução de Assinaturas
            </h2>
            <ContractsChart timeFilter={timeFilter} />
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 print:text-black">
              Funil de Vendas
            </h2>
            <SalesFunnel timeFilter={timeFilter} />
          </div>
        </section>
      </div>
    </div>
  )
}
