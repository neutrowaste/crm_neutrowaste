import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useContracts } from '@/contexts/ContractsContext'
import { useLeads } from '@/contexts/LeadsContext'
import { useLogs } from '@/contexts/LogsContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import logoImg from '../assets/neutrowaste-0b9d5.jpg'
import { CheckCircle, FileText, XCircle, FileSignature } from 'lucide-react'

export default function Portal() {
  const { contractId } = useParams<{ contractId: string }>()
  const { contracts, updateContractStatus } = useContracts()
  const { leads, updateLead } = useLeads()
  const { addLog } = useLogs()
  const { allUsers } = useAuth()

  const contract = contracts.find((c) => c.id === contractId)
  const lead = contract ? leads.find((l) => l.id === contract.leadId) : null

  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false)
  const [signatureName, setSignatureName] = useState('')
  const [hasSigned, setHasSigned] = useState(false)

  useEffect(() => {
    if (
      contract &&
      lead &&
      !hasSigned &&
      contract.status === 'Sent for Signature'
    ) {
      const hasAccessed = sessionStorage.getItem(`portal_access_${contractId}`)
      if (!hasAccessed) {
        addLog({
          userId: 'customer',
          userName: lead.name,
          action: 'Acesso ao Portal',
          leadId: lead.id,
          leadName: lead.name,
          details: `O cliente acessou o portal para visualizar o documento: ${contract.name}`,
        })
        sessionStorage.setItem(`portal_access_${contractId}`, 'true')
      }
    }
  }, [contract, lead, contractId, hasSigned, addLog])

  if (!contract || !lead) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <img
          src={logoImg}
          alt="Neutrowaste Logo"
          className="h-12 object-contain mb-8 grayscale opacity-50"
        />
        <Card className="max-w-md w-full text-center p-6 shadow-sm border-gray-200">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Documento Não Encontrado
          </h2>
          <p className="text-muted-foreground text-sm">
            O link acessado é inválido ou o documento foi removido.
          </p>
        </Card>
      </div>
    )
  }

  const isAlreadyProcessed = contract.status === 'Signed' || hasSigned
  const isInvalid =
    contract.status === 'Draft' || contract.status === 'Rejected'

  const handleSign = () => {
    if (!signatureName.trim()) return

    updateContractStatus(contract.id, 'Signed')

    if (lead.status !== 'Ganho') {
      updateLead(lead.id, { status: 'Ganho' })
    }

    addLog({
      userId: 'customer',
      userName: signatureName,
      action: 'Assinatura',
      leadId: lead.id,
      leadName: lead.name,
      details: `Documento "${contract.name}" assinado digitalmente por ${signatureName} no Portal do Cliente.`,
    })

    const salesperson = allUsers.find((u) => u.id === contract.uploadedBy)
    const emailBody = `Olá ${lead.name},\n\nO documento "${contract.name}" da ${lead.company} foi assinado com sucesso. Uma cópia foi enviada para ${salesperson?.email || 'seu consultor'}.\n\nObrigado por escolher a Neutrowaste!`

    addLog({
      userId: 'system',
      userName: 'Sistema Automático',
      action: 'Email Enviado',
      leadId: lead.id,
      leadName: lead.name,
      details: `Confirmação de assinatura enviada para ${lead.email} e ${salesperson?.email}.\n\nConteúdo:\n${emailBody}`,
    })

    setHasSigned(true)
    setIsSignDialogOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50 font-sans">
      <header className="flex h-20 items-center justify-center border-b bg-white px-6 shadow-sm">
        <img
          src={logoImg}
          alt="Neutrowaste Logo"
          className="h-10 object-contain"
        />
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full animate-fade-in">
        {isAlreadyProcessed ? (
          <Card className="max-w-xl mx-auto mt-12 text-center p-8 shadow-sm">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Documento Processado
            </h1>
            <p className="text-muted-foreground mb-6">
              Este documento já foi assinado e finalizado. Uma cópia foi enviada
              para o seu e-mail de contato.
            </p>
          </Card>
        ) : isInvalid ? (
          <Card className="max-w-xl mx-auto mt-12 text-center p-8 shadow-sm">
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Link Indisponível
            </h1>
            <p className="text-muted-foreground">
              O documento que você está tentando acessar não está disponível
              para assinatura no momento.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="h-[600px] flex flex-col shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg font-medium text-gray-800">
                      {contract.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 bg-gray-200/50 p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden rounded-b-lg">
                  <div className="absolute inset-4 md:inset-8 bg-white shadow-md border rounded-md p-8 flex flex-col items-center justify-center text-center">
                    <FileSignature className="h-16 w-16 mb-4 text-gray-300" />
                    <p className="font-medium text-gray-500 text-lg">
                      Visualizador de Documento Seguro
                    </p>
                    <p className="text-sm text-gray-400 mt-2 max-w-sm">
                      Esta é uma visualização protegida do seu contrato. Por
                      favor, revise todos os termos antes de prosseguir com a
                      assinatura.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="bg-muted/10 border-b">
                  <CardTitle className="text-lg">
                    Painel de Assinatura
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Parte Contratante
                    </p>
                    <p className="font-medium text-gray-900">{lead.company}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Representante Legal
                    </p>
                    <p className="text-gray-900">{lead.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Contato de Confirmação
                    </p>
                    <p className="text-gray-900">{lead.email}</p>
                  </div>
                  <div className="pt-6 border-t border-dashed">
                    <Button
                      className="w-full h-12 text-base font-medium shadow-md transition-transform hover:-translate-y-0.5"
                      onClick={() => setIsSignDialogOpen(true)}
                    >
                      <FileSignature className="w-5 h-5 mr-2" />
                      Assinar Documento
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="text-xs text-muted-foreground text-center px-2">
                Ao assinar este documento, você concorda com os termos legais. O
                registro captura seu endereço IP e dados de sessão para fins de
                auditoria jurídica.
              </div>
            </div>
          </div>
        )}
      </main>

      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assinatura Digital</DialogTitle>
            <DialogDescription>
              Para concordar e assinar "{contract.name}", digite seu nome
              completo conforme documento de identidade.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nome Completo (Assinatura)
              </label>
              <Input
                placeholder="Ex: João da Silva"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsSignDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSign} disabled={!signatureName.trim()}>
              Confirmar Assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
