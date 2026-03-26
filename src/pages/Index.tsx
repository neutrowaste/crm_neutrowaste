import { InteractionHistory } from '@/components/dashboard/InteractionHistory'
import { Metrics } from '@/components/dashboard/Metrics'
import { SalesFunnel } from '@/components/dashboard/SalesFunnel'
import { TaskSchedule } from '@/components/dashboard/TaskSchedule'
import { TeamPerformance } from '@/components/dashboard/TeamPerformance'
import { PendingSignatures } from '@/components/dashboard/PendingSignatures'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Index() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Painel
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está o que está acontecendo com seus leads.
          </p>
        </div>
        <Button onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        {user?.role === 'Admin' && (
          <TabsList className="print:hidden">
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">
              <Users className="w-4 h-4 mr-2" /> Performance da Equipe
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="geral" className="space-y-8">
          <Metrics />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <SalesFunnel />
              <InteractionHistory />
            </div>
            <div className="space-y-8 print:hidden">
              <TaskSchedule />
              <PendingSignatures />
            </div>
          </div>
        </TabsContent>

        {user?.role === 'Admin' && (
          <TabsContent value="performance">
            <TeamPerformance />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
