import { InteractionHistory } from '@/components/dashboard/InteractionHistory'
import { Metrics } from '@/components/dashboard/Metrics'
import { SalesFunnel } from '@/components/dashboard/SalesFunnel'
import { TaskSchedule } from '@/components/dashboard/TaskSchedule'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Painel
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está o que está acontecendo com seus leads
            hoje.
          </p>
        </div>
        <Button onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold">
          Relatório do Painel - Neutrowaste
        </h1>
        <p className="text-sm text-gray-500">
          Gerado em: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      <Metrics />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <SalesFunnel />
          <InteractionHistory />
        </div>
        <div className="print:hidden">
          <TaskSchedule />
        </div>
      </div>
    </div>
  )
}
