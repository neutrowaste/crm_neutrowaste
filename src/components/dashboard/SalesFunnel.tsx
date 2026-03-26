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

export function SalesFunnel() {
  const { leads } = useLeads()

  const data = useMemo(() => {
    const stages = [
      { id: 'Novo', label: 'Novo' },
      { id: 'Contatado', label: 'Contatado' },
      { id: 'Qualificado', label: 'Qualificado' },
      { id: 'Proposta', label: 'Proposta' },
      { id: 'Ganho', label: 'Ganho' },
    ]

    return stages.map((stage) => ({
      name: stage.label,
      value: leads.filter((l) => l.status === stage.id).length,
    }))
  }, [leads])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Vendas</CardTitle>
        <CardDescription>Distribuição de leads por etapa</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: 'Quantidade',
              color: 'hsl(var(--primary))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
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
