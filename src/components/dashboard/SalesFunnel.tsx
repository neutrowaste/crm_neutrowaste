import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useLeads } from '@/contexts/LeadsContext'
import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { subDays, startOfMonth } from 'date-fns'

interface Props {
  timeFilter?: string
  dateRange?: { start: string; end: string }
}

export function SalesFunnel({ timeFilter = 'monthly', dateRange }: Props) {
  const { leads } = useLeads()

  const data = useMemo(() => {
    let startDate = subDays(new Date(), 30)
    let endDate = new Date()

    if (timeFilter === 'weekly') startDate = subDays(new Date(), 7)
    if (timeFilter === 'monthly') startDate = startOfMonth(new Date())
    if (timeFilter === 'quarterly') startDate = subDays(new Date(), 90)
    if (timeFilter === 'custom' && dateRange?.start) {
      startDate = new Date(dateRange.start)
      if (dateRange.end) {
        endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59, 999)
      }
    }

    const filteredLeads = leads.filter((l) => {
      const d = new Date(l.updatedAt || l.created_at)
      return d >= startDate && d <= endDate
    })

    const stages = [
      { id: 'Novo', label: 'Novo' },
      { id: 'Contatado', label: 'Contatado' },
      { id: 'Qualificado', label: 'Qualificado' },
      { id: 'Proposta', label: 'Proposta' },
      { id: 'Ganho', label: 'Ganho' },
    ]

    return stages.map((stage) => ({
      name: stage.label,
      value: filteredLeads.filter((l) => l.status === stage.id).length,
    }))
  }, [leads, timeFilter, dateRange])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Funil de Vendas</CardTitle>
        <CardDescription>Distribuição de leads por etapa</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={{
            value: {
              label: 'Quantidade',
              color: 'hsl(var(--primary))',
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
