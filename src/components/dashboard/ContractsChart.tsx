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
import { useIsMobile } from '@/hooks/use-mobile'

export function ContractsChart({
  timeFilter = 'monthly',
  dateRange,
}: {
  timeFilter?: string
  dateRange?: { start: string; end: string }
}) {
  const { contracts } = useContracts()
  const isMobile = useIsMobile()

  const data = useMemo(() => {
    let numDays = 30
    if (timeFilter === 'weekly') numDays = 7
    if (timeFilter === 'quarterly') numDays = 90

    const days = []
    if (timeFilter === 'custom' && dateRange?.start && dateRange?.end) {
      const start = new Date(dateRange.start + 'T12:00:00')
      const end = new Date(dateRange.end + 'T12:00:00')
      const diffDays = Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      )
      const limitDays = Math.min(diffDays + 1, 90)

      for (let i = limitDays - 1; i >= 0; i--) {
        days.push(subDays(end, i))
      }
    } else {
      for (let i = numDays - 1; i >= 0; i--) {
        days.push(subDays(new Date(), i))
      }
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Assinaturas de Contratos</CardTitle>
        <CardDescription>Tendência no período selecionado</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={{
            value: { label: 'Assinaturas', color: 'hsl(var(--primary))' },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value, index) => {
                  // Hide some labels on mobile to prevent overlap
                  if (isMobile && data.length > 7 && index % 2 !== 0) return ''
                  return value
                }}
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
