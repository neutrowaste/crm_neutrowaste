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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'

export function PredictiveAnalysis() {
  const currentMonthIndex = new Date().getMonth()

  // Generate mock data mimicking historical growth and future prediction
  const data = [
    { name: 'Out', value: 35000, predicted: null },
    { name: 'Nov', value: 42000, predicted: null },
    { name: 'Dez', value: 38000, predicted: null },
    { name: 'Jan', value: 55000, predicted: 55000 }, // Connection point
    { name: 'Fev', value: null, predicted: 62000 },
    { name: 'Mar', value: null, predicted: 75000 },
    { name: 'Abr', value: null, predicted: 81000 },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Estimativa de Volume de Vendas</CardTitle>
        <CardDescription>
          Análise preditiva baseada no histórico de contratos fechados e
          pipeline atual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: 'Realizado (R$)',
              color: 'hsl(var(--primary))',
            },
            predicted: {
              label: 'Projetado (R$)',
              color: 'hsl(var(--primary) / 0.4)',
            },
          }}
          className="h-[350px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorProjetado" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-predicted)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-predicted)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <pattern
                  id="diagonalHatch"
                  width="4"
                  height="4"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="4"
                    stroke="var(--color-predicted)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${val / 1000}k`}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />

              <ReferenceLine
                x="Jan"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                label={{
                  position: 'top',
                  value: 'Hoje',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12,
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRealizado)"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="var(--color-predicted)"
                strokeWidth={3}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorProjetado)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-muted/30 rounded-lg border">
            <p className="text-xs text-muted-foreground font-medium uppercase">
              Crescimento M/M
            </p>
            <p className="text-lg font-bold text-green-600 mt-1">+14.5%</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border">
            <p className="text-xs text-muted-foreground font-medium uppercase">
              Confiança
            </p>
            <p className="text-lg font-bold text-blue-600 mt-1">82%</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border col-span-2">
            <p className="text-xs text-muted-foreground font-medium uppercase">
              Próximo Trimestre (Est.)
            </p>
            <p className="text-lg font-bold text-foreground mt-1">
              R$ 218.000,00
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
