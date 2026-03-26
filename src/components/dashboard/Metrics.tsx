import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLeads } from '@/contexts/LeadsContext'
import { Users, Target, TrendingUp, DollarSign } from 'lucide-react'

export function Metrics() {
  const { leads } = useLeads()

  const totalLeads = leads.length

  const openLeads = leads.filter((l) =>
    ['Novo', 'Contatado'].includes(l.status),
  ).length

  const inProgress = leads.filter((l) =>
    ['Qualificado', 'Proposta'].includes(l.status),
  ).length

  const wonLeads = leads.filter((l) => l.status === 'Ganho').length

  const conversionRate = totalLeads
    ? Math.round((wonLeads / totalLeads) * 100)
    : 0

  const metrics = [
    {
      title: 'Total de Leads',
      value: totalLeads.toString(),
      icon: Users,
      trend: '+12% em relação ao mês passado',
      trendUp: true,
    },
    {
      title: 'Leads em Aberto',
      value: openLeads.toString(),
      icon: Target,
      trend: 'Novos e contatados',
      trendUp: true,
    },
    {
      title: 'Negociações em Andamento',
      value: inProgress.toString(),
      icon: TrendingUp,
      trend: 'Qualificados e com proposta',
      trendUp: true,
    },
    {
      title: 'Conversão (%)',
      value: `${conversionRate}%`,
      icon: DollarSign,
      trend: 'Leads ganhos vs total',
      trendUp: true,
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
