import { useAuth } from '@/contexts/AuthContext'
import { useLeads } from '@/contexts/LeadsContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { useMemo } from 'react'

export function TeamPerformance() {
  const { allUsers } = useAuth()
  const { leads } = useLeads()

  const stats = useMemo(() => {
    return allUsers
      .map((user) => {
        const userLeads = leads.filter((l) => l.assignedTo === user.id)
        const totalAssigned = userLeads.length
        const wonLeads = userLeads.filter((l) => l.status === 'Ganho').length
        const conversionRate = totalAssigned
          ? Math.round((wonLeads / totalAssigned) * 100)
          : 0

        const pipelineValue = userLeads
          .filter((l) =>
            ['Novo', 'Contatado', 'Qualificado', 'Proposta'].includes(l.status),
          )
          .reduce((sum, l) => sum + (l.value || 0), 0)

        return {
          id: user.id,
          name: user.name,
          totalAssigned,
          conversionRate,
          pipelineValue,
          wonLeads,
        }
      })
      .sort((a, b) => b.pipelineValue - a.pipelineValue)
  }, [allUsers, leads])

  const chartData = stats
    .filter((s) => s.pipelineValue > 0)
    .map((s, index) => ({
      name: s.name,
      value: s.pipelineValue,
      fill: `hsl(var(--primary) / ${1 - index * 0.15})`,
    }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>KPIs da Equipe</CardTitle>
              <CardDescription>
                Métricas de vendas por colaborador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">
                      Leads Atribuídos
                    </TableHead>
                    <TableHead className="text-right">Conversão (%)</TableHead>
                    <TableHead className="text-right">Valor Pipeline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((userStat) => (
                    <TableRow key={userStat.id}>
                      <TableCell className="font-medium">
                        {userStat.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {userStat.totalAssigned}
                      </TableCell>
                      <TableCell className="text-right">
                        {userStat.conversionRate}%
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(userStat.pipelineValue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Distribuição do Pipeline</CardTitle>
              <CardDescription>Valor em aberto por vendedor</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum dado de pipeline.
                </p>
              ) : (
                <ChartContainer
                  config={{ value: { label: 'Pipeline' } }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
