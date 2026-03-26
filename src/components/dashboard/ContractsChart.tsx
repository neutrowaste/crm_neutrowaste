import { useContracts } from '@/contexts/ContractsContext'
import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { format, subDays, isSameDay } from 'date-fns'

export function ContractsChart({
  timeFilter = 'monthly',
}: {
  timeFilter?: string
}) {
  const { contracts } = useContracts()

  const data = useMemo(() => {
    let numDays = 30
    if (timeFilter === 'weekly') numDays = 7
    if (timeFilter === 'quarterly') numDays = 90

    const days = []
    for (let i = numDays - 1; i >= 0; i--) {
      days.push(subDays(new Date(), i))
    }

    return days.map((day) => {
      const signedThatDay = contracts.filter(
        (c) =>
          c.status === 'Signed' &&
          c.updatedAt &&
          isSameDay(new Date(c.updatedAt), day),
      ).length

      return {
        date: format(day, 'dd/MM'),
        value: signedThatDay,
      }
    })
  }, [contracts, timeFilter])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assinaturas de Contratos</CardTitle>
        <CardDescription>Tendência no período selecionado</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: { label: 'Assinaturas', color: 'hsl(var(--primary))' },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
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
