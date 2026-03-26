import { useAuth } from '@/contexts/AuthContext'
import { useLeads } from '@/contexts/LeadsContext'
import { useContracts } from '@/contexts/ContractsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react'

export function TeamPerformance() {
  const { allUsers } = useAuth()
  const { leads } = useLeads()
  const { contracts } = useContracts()

  const performance = allUsers.map((u) => {
    const userLeads = leads.filter((l) => l.assignedTo === u.id)
    const wonLeads = userLeads.filter((l) => l.status === 'Ganho')
    const userContracts = contracts.filter((c) => c.uploadedBy === u.id)
    const signedContracts = userContracts.filter((c) => c.status === 'Signed')

    const totalValue = wonLeads.reduce((acc, l) => acc + (l.value || 0), 0)
    const conversionRate =
      userLeads.length > 0
        ? Math.round((wonLeads.length / userLeads.length) * 100)
        : 0

    return {
      user: u,
      activeLeads: userLeads.length,
      won: wonLeads.length,
      signed: signedContracts.length,
      totalValue,
      conversionRate,
    }
  })

  const sortedPerformance = performance.sort((a, b) => b.won - a.won)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedPerformance.map((p, index) => (
            <div
              key={p.user.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarImage
                      src={`https://img.usecurling.com/ppl/thumbnail?seed=${p.user.id}`}
                    />
                    <AvatarFallback>
                      {p.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1 shadow-md">
                      <Trophy className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {p.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{p.user.name}</p>
                  <p className="text-sm text-muted-foreground">{p.user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center hidden sm:block">
                  <p className="text-sm text-muted-foreground">Conversão</p>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp
                      className={`h-3 w-3 ${p.conversionRate > 20 ? 'text-green-500' : 'text-red-500'}`}
                    />
                    <p className="font-medium">{p.conversionRate}%</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Leads Ganhos</p>
                  <Badge variant="secondary" className="font-bold px-3">
                    {p.won}
                  </Badge>
                </div>
                <div className="text-right w-24">
                  <p className="text-sm text-muted-foreground">Receita</p>
                  <p className="font-bold text-primary text-sm">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 0,
                    }).format(p.totalValue)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {sortedPerformance.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
              Nenhum dado de performance disponível.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
