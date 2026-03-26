import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLeads } from '@/contexts/LeadsContext'
import { Users, Target, TrendingUp, DollarSign } from 'lucide-react'

export function Metrics() {
  const { leads } = useLeads()

  const totalLeads = leads.length
  const activeOpportunities = leads.filter((l) =>
    ['Novo', 'Contatado', 'Qualificado', 'Proposta'].includes(l.status),
  ).length
  const wonLeads = leads.filter((l) => l.status === 'Ganho').length
  const conversionRate = totalLeads
    ? Math.round((wonLeads / totalLeads) * 100)
    : 0
  const expectedValue = leads.reduce((acc, lead) => acc + (lead.value || 0), 0)

  const metrics = [
    {
      title: 'Total de Leads',
      value: totalLeads.toString(),
      icon: Users,
      trend: '+12% em relação ao mês passado',
      trendUp: true,
    },
    {
      title: 'Oportunidades Ativas',
      value: activeOpportunities.toString(),
      icon: Target,
      trend: '+4 novas esta semana',
      trendUp: true,
    },
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      trend: '+2% em relação ao mês passado',
      trendUp: true,
    },
    {
      title: 'Receita Esperada',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(expectedValue),
      icon: DollarSign,
      trend: 'Baseado em leads qualificados',
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
