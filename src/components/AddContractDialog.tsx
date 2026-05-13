import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useContracts } from '@/contexts/ContractsContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLeads } from '@/contexts/LeadsContext'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Loader2 } from 'lucide-react'

interface AddContractDialogProps {
  defaultLeadId?: string
  className?: string
}

export function AddContractDialog({
  defaultLeadId,
  className,
}: AddContractDialogProps = {}) {
  const { addContract } = useContracts()
  const { user } = useAuth()
  const { leads } = useLeads()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [leadId, setLeadId] = useState(defaultLeadId || '')
  const [name, setName] = useState('')
  const [vigencia, setVigencia] = useState('')
  const [objeto, setObjeto] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataTermino, setDataTermino] = useState('')
  const [nomeGestor, setNomeGestor] = useState('')
  const [telefoneGestor, setTelefoneGestor] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      setLeadId(defaultLeadId || '')
    }
  }, [open, defaultLeadId])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 11) val = val.substring(0, 11)
    if (val.length > 2) val = `(${val.substring(0, 2)}) ${val.substring(2)}`
    if (val.length > 9) val = `${val.substring(0, 10)}-${val.substring(10)}`
    setTelefoneGestor(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadId || !name) {
      toast({
        title: 'Erro',
        description: 'Preencha os campos obrigatórios',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      let file_url = null

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${leadId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('contracts')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('contracts')
          .getPublicUrl(filePath)

        file_url = publicUrlData.publicUrl
      }

      await addContract({
        lead_id: leadId,
        name,
        vigencia,
        objeto,
        data_inicio: dataInicio || null,
        data_termino: dataTermino || null,
        nome_gestor: nomeGestor,
        telefone_gestor: telefoneGestor,
        file_url,
        status: 'Draft',
        uploaded_by: user?.id,
        uploaded_by_name: user?.name,
      })

      setOpen(false)
      setLeadId('')
      setName('')
      setVigencia('')
      setObjeto('')
      setDataInicio('')
      setDataTermino('')
      setNomeGestor('')
      setTelefoneGestor('')
      setFile(null)
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao salvar contrato',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <Plus className="h-4 w-4 mr-2" /> Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Contrato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-4">
          <div className="col-span-2 space-y-2">
            <Label>Lead *</Label>
            <Select
              value={leadId}
              onValueChange={setLeadId}
              disabled={!!defaultLeadId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o lead..." />
              </SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name} {l.company ? `(${l.company})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label>Nome do Contrato *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Contrato de Prestação..."
            />
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label>Vigência</Label>
            <Select value={vigencia} onValueChange={setVigencia}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 meses</SelectItem>
                <SelectItem value="36">36 meses</SelectItem>
                <SelectItem value="48">48 meses</SelectItem>
                <SelectItem value="60">60 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Objeto</Label>
            <Input
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
              placeholder="Objeto do contrato..."
            />
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label>Data Início</Label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label>Data Término</Label>
            <Input
              type="date"
              value={dataTermino}
              onChange={(e) => setDataTermino(e.target.value)}
            />
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label>Nome do Gestor</Label>
            <Input
              value={nomeGestor}
              onChange={(e) => setNomeGestor(e.target.value)}
              placeholder="Nome do gestor..."
            />
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label>Telefone do Gestor</Label>
            <Input
              value={telefoneGestor}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Arquivo do Contrato</Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salvar Contrato
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
