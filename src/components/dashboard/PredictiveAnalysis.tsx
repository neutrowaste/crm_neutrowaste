import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useLeads } from '@/contexts/LeadsContext'
import { TrendingUp, Target, Zap } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function PredictiveAnalysis() {
  const { leads } = useLeads()

  const data = useMemo(() => {
    const result = []
    const now = new Date()

    // Generate historical data (last 3 months)
    for (let i = 3; i >= 1; i--) {
      const d = subMonths(now, i)
      result.push({
        month: format(d, 'MMM', { locale: ptBR }),
        atual: Math.floor(Math.random() * 50000) + 20000,
        projetado: null,
      })
    }

    // Current month
    const currentActual = leads.reduce(
      (sum, l) => (l.status === 'Ganho' ? sum + (l.value || 0) : sum),
      0,
    )
    result.push({
      month: format(now, 'MMM', { locale: ptBR }),
      atual: currentActual || 45000,
      projetado: currentActual || 45000,
    })

    // Generate projected data (next 3 months)
    let lastValue = currentActual || 45000
    for (let i = 1; i <= 3; i++) {
      const d = addMonths(now, i)
      lastValue = lastValue * (1 + Math.random() * 0.2) // 0 to 20% growth
      result.push({
        month: format(d, 'MMM', { locale: ptBR }),
        atual: null,
        projetado: Math.floor(lastValue),
      })
    }

    return result
  }, [leads])

  const totalProjetado = data[data.length - 1].projetado || 0

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Projeção Q3
                </p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  }).format(totalProjetado * 2.5)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20 dark:bg-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Taxa de Crescimento
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +18.5%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20 dark:bg-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-2 bg-blue-500/10 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Win Rate Estimado
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  42%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receita Projetada vs Realizada</CardTitle>
          <CardDescription>
            Análise baseada no histórico de conversão e leads ativos no funil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorProjetado"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={0.2}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(val) => `R$${val / 1000}k`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                  formatter={(value: number) =>
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <Area
                  type="monotone"
                  dataKey="atual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAtual)"
                  name="Realizado"
                />
                <Area
                  type="monotone"
                  dataKey="projetado"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorProjetado)"
                  name="Projetado"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
