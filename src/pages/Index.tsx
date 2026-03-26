import { useState } from 'react'
import { InteractionHistory } from '@/components/dashboard/InteractionHistory'
import { Metrics } from '@/components/dashboard/Metrics'
import { SalesFunnel } from '@/components/dashboard/SalesFunnel'
import { TaskSchedule } from '@/components/dashboard/TaskSchedule'
import { TeamPerformance } from '@/components/dashboard/TeamPerformance'
import { PendingSignatures } from '@/components/dashboard/PendingSignatures'
import { ContractsChart } from '@/components/dashboard/ContractsChart'
import { PredictiveAnalysis } from '@/components/dashboard/PredictiveAnalysis'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Download,
  Users,
  FileText,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [timeFilter, setTimeFilter] = useState('monthly')

  const handleExport = (format: string) => {
    toast({
      title: 'Exportando Relatório',
      description: `O dashboard está sendo exportado para ${format}. O download iniciará em breve.`,
    })
    if (format === 'PDF') {
      window.print()
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Painel de Performance
          </h1>
          <p className="text-muted-foreground">
            Visão geral de vendas e métricas de conversão.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="print:hidden h-auto flex-wrap justify-start bg-transparent p-0 gap-2">
          <TabsTrigger
            value="geral"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Visão Geral
          </TabsTrigger>
          {user?.role === 'Admin' && (
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
            >
              <Users className="w-4 h-4 mr-2" /> Performance da Equipe
            </TabsTrigger>
          )}
          {user?.role === 'Admin' && (
            <TabsTrigger
              value="predictive"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
            >
              <TrendingUp className="w-4 h-4 mr-2" /> Análise Preditiva
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="geral" className="space-y-8 mt-4">
          <Metrics timeFilter={timeFilter} />

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <ContractsChart timeFilter={timeFilter} />
            <SalesFunnel timeFilter={timeFilter} />
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <InteractionHistory />
            </div>
            <div className="space-y-8 print:hidden">
              <TaskSchedule />
              <PendingSignatures />
            </div>
          </div>
        </TabsContent>

        {user?.role === 'Admin' && (
          <TabsContent value="performance" className="mt-4">
            <TeamPerformance />
          </TabsContent>
        )}

        {user?.role === 'Admin' && (
          <TabsContent value="predictive" className="mt-4">
            <PredictiveAnalysis />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
