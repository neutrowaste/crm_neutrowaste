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

export function RevenueByStatusChart({
  timeFilter = 'monthly',
  dateRange,
}: Props) {
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

    return stages.map((stage) => {
      const stageLeads = filteredLeads.filter((l) => l.status === stage.id)
      const totalValue = stageLeads.reduce(
        (acc, lead) => acc + (lead.value || 0),
        0,
      )
      return {
        name: stage.label,
        value: totalValue,
      }
    })
  }, [leads, timeFilter, dateRange])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Valor Total por Etapa</CardTitle>
        <CardDescription>Receita potencial acumulada</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ChartContainer
          config={{
            value: {
              label: 'Valor (R$)',
              color: 'hsl(var(--primary))',
            },
          }}
          className="h-full w-full"
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
                tickFormatter={(val) =>
                  `R$ ${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`
                }
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
