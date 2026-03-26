import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLeads } from '@/contexts/LeadsContext'
import { useContracts } from '@/contexts/ContractsContext'
import { FileText, Percent, Clock, DollarSign } from 'lucide-react'

export function Metrics() {
  const { leads } = useLeads()
  const { contracts } = useContracts()

  const totalContracts = contracts.length

  const signedContracts = contracts.filter((c) => c.status === 'Signed').length

  const conversionRate =
    totalContracts > 0
      ? Math.round((signedContracts / totalContracts) * 100)
      : 0

  const pendingSignatures = contracts.filter(
    (c) => c.status === 'Sent for Signature',
  ).length

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyRevenue = contracts
    .filter((c) => {
      const d = new Date(c.updatedAt)
      return (
        c.status === 'Signed' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      )
    })
    .reduce((sum, c) => {
      const lead = leads.find((l) => l.id === c.leadId)
      return sum + (lead?.value || 0)
    }, 0)

  const metrics = [
    {
      title: 'Total de Contratos',
      value: totalContracts.toString(),
      icon: FileText,
      trend: 'Gerenciados no sistema',
    },
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      icon: Percent,
      trend: 'Contratos assinados vs total',
    },
    {
      title: 'Assinaturas Pendentes',
      value: pendingSignatures.toString(),
      icon: Clock,
      trend: 'Aguardando ação do cliente',
    },
    {
      title: 'Receita Mensal',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(monthlyRevenue),
      icon: DollarSign,
      trend: 'Contratos assinados este mês',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
