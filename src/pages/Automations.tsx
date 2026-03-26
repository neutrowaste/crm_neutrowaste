import { useAuth } from '@/contexts/AuthContext'
import { useAutomations } from '@/contexts/AutomationsContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Navigate } from 'react-router-dom'
import { Mail, CalendarCheck } from 'lucide-react'

export default function AutomationsPage() {
  const { user } = useAuth()
  const { emailOnProposal, setEmailOnProposal, taskOnWon, setTaskOnWon } =
    useAutomations()

  if (user?.role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Gatilhos Automáticos
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure ações automáticas para otimizar o fluxo de trabalho da sua
          equipe.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Comunicação Automática
            </CardTitle>
            <CardDescription>
              Ações disparadas que interagem diretamente com o cliente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-4 border p-4 rounded-lg">
              <div className="space-y-1">
                <Label
                  htmlFor="email-proposal"
                  className="text-base font-semibold"
                >
                  Notificação de Proposta Enviada
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ao mover um lead para a coluna "Contract Sent" no Kanban,
                  envia um e-mail automático (mock) avisando que o contrato está
                  a caminho.
                </p>
              </div>
              <Switch
                id="email-proposal"
                checked={emailOnProposal}
                onCheckedChange={setEmailOnProposal}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Gestão de Tarefas
            </CardTitle>
            <CardDescription>
              Ações disparadas para manter a equipe atualizada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-4 border p-4 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="task-won" className="text-base font-semibold">
                  Tarefa de Boas-Vindas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ao mover um lead para a coluna "Signed" (Ganho), cria
                  automaticamente uma tarefa de acompanhamento inicial
                  (Onboarding) para o dia seguinte.
                </p>
              </div>
              <Switch
                id="task-won"
                checked={taskOnWon}
                onCheckedChange={setTaskOnWon}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
