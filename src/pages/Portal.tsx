import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
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
import {
  CheckCircle,
  FileText,
  XCircle,
  FileSignature,
  Loader2,
} from 'lucide-react'

export default function Portal() {
  const { contractId } = useParams<{ contractId: string }>()

  const [contractData, setContractData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false)
  const [signatureName, setSignatureName] = useState('')
  const [hasSigned, setHasSigned] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId) return

      try {
        const { data, error } = await supabase.rpc('get_public_contract', {
          p_contract_id: contractId,
        })

        if (error || !data || !data.contract) {
          throw error || new Error('Not found')
        }

        setContractData(data)

        // Log access
        const hasAccessed = sessionStorage.getItem(
          `portal_access_${contractId}`,
        )
        if (!hasAccessed && data.contract.status === 'Sent for Signature') {
          await supabase.rpc('log_portal_access', { p_contract_id: contractId })
          sessionStorage.setItem(`portal_access_${contractId}`, 'true')
        }
      } catch (err) {
        console.error('Error fetching contract:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchContract()
  }, [contractId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !contractData || !contractData.contract || !contractData.lead) {
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

  const { contract, lead } = contractData
  const isAlreadyProcessed = contract.status === 'Signed' || hasSigned
  const isInvalid =
    contract.status === 'Draft' || contract.status === 'Rejected'

  const handleSign = async () => {
    if (!signatureName.trim() || !contractId) return
    setIsProcessing(true)

    try {
      const { error } = await supabase.rpc('sign_public_contract', {
        p_contract_id: contractId,
        p_signature_name: signatureName,
      })

      if (error) throw error

      setHasSigned(true)
      setIsSignDialogOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
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
                    <CardTitle className="text-lg font-medium text-gray-800 flex-1 truncate">
                      {contract.name}
                    </CardTitle>
                    {contract.file_url && (
                      <a
                        href={contract.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Abrir em nova guia
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 bg-gray-200/50 p-0 flex flex-col items-center justify-center relative overflow-hidden rounded-b-lg">
                  {contract.file_url ? (
                    <iframe
                      src={`${contract.file_url}#toolbar=0`}
                      className="w-full h-full border-0"
                      title="Documento"
                    />
                  ) : (
                    <div className="absolute inset-4 md:inset-8 bg-white shadow-md border rounded-md p-8 flex flex-col items-center justify-center text-center">
                      <FileSignature className="h-16 w-16 mb-4 text-gray-300" />
                      <p className="font-medium text-gray-500 text-lg">
                        Visualizador de Documento Seguro
                      </p>
                      <p className="text-sm text-gray-400 mt-2 max-w-sm">
                        O arquivo deste contrato não está disponível para
                        visualização direta, mas você pode assiná-lo usando o
                        painel ao lado.
                      </p>
                    </div>
                  )}
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
                      disabled={isProcessing}
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
              Para concordar e assinar "{contract?.name}", digite seu nome
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
                disabled={isProcessing}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsSignDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSign}
              disabled={!signatureName.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Assinatura'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
