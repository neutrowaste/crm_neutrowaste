import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLeads } from '@/contexts/LeadsContext'
import { useContracts } from '@/contexts/ContractsContext'
import { FileText, Percent, Clock, DollarSign } from 'lucide-react'
import { useMemo } from 'react'
import { subDays } from 'date-fns'

export function Metrics({ timeFilter = 'monthly' }: { timeFilter?: string }) {
  const { leads } = useLeads()
  const { contracts } = useContracts()

  const { totalContracts, conversionRate, pendingSignatures, revenue } =
    useMemo(() => {
      let days = 30
      if (timeFilter === 'weekly') days = 7
      if (timeFilter === 'quarterly') days = 90

      const startDate = subDays(new Date(), days)

      const filteredContracts = contracts.filter(
        (c) => new Date(c.updatedAt) >= startDate,
      )

      const total = filteredContracts.length
      const signed = filteredContracts.filter(
        (c) => c.status === 'Signed',
      ).length
      const rate = total > 0 ? Math.round((signed / total) * 100) : 0
      const pending = filteredContracts.filter(
        (c) => c.status === 'Sent for Signature',
      ).length

      const rev = filteredContracts
        .filter((c) => c.status === 'Signed')
        .reduce((sum, c) => {
          const lead = leads.find((l) => l.id === c.leadId)
          return sum + (lead?.value || 0)
        }, 0)

      return {
        totalContracts: total,
        conversionRate: rate,
        pendingSignatures: pending,
        revenue: rev,
      }
    }, [contracts, leads, timeFilter])

  const metrics = [
    {
      title: 'Total de Contratos',
      value: totalContracts.toString(),
      icon: FileText,
      trend: 'No período selecionado',
    },
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      icon: Percent,
      trend: 'Contratos assinados',
    },
    {
      title: 'Assinaturas Pendentes',
      value: pendingSignatures.toString(),
      icon: Clock,
      trend: 'Aguardando clientes',
    },
    {
      title: 'Receita',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }).format(revenue),
      icon: DollarSign,
      trend: 'Contratos assinados',
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card
            key={metric.title}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
