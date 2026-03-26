import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useLeads } from '@/contexts/LeadsContext'
import { addDays } from 'date-fns'

export type ContractStatus =
  | 'Draft'
  | 'Sent for Signature'
  | 'Signed'
  | 'Rejected'

export interface Contract {
  id: string
  leadId: string
  name: string
  status: ContractStatus
  uploadedBy: string
  uploadedByName: string
  createdAt: string
  updatedAt: string
  fileUrl?: string
  expiresAt?: string
}

interface ContractsContextType {
  contracts: Contract[]
  addContract: (
    contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<string>
  updateContractStatus: (id: string, status: ContractStatus) => Promise<void>
  deleteContract: (id: string) => Promise<void>
}

const ContractsContext = createContext<ContractsContextType | undefined>(
  undefined,
)

const mapContract = (data: any): Contract => ({
  id: data.id,
  leadId: data.lead_id,
  name: data.name,
  status: data.status,
  uploadedBy: data.uploaded_by || '',
  uploadedByName: data.uploaded_by_name || 'Usuário',
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  fileUrl: data.file_url || undefined,
  expiresAt: data.expires_at || undefined,
})

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const { toast } = useToast()
  const { leads, addNotification } = useLeads()
  const prevContractsRef = useRef<Contract[]>([])

  useEffect(() => {
    const fetchContracts = async () => {
      const { data } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) {
        const mapped = data.map(mapContract)
        setContracts(mapped)
        prevContractsRef.current = mapped
      }
    }
    fetchContracts()

    const channel = supabase
      .channel('public:contracts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contracts' },
        (payload) => {
          fetchContracts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const addContract = async (
    newContract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        lead_id: newContract.leadId,
        name: newContract.name,
        status: newContract.status,
        uploaded_by: newContract.uploadedBy,
        uploaded_by_name: newContract.uploadedByName,
        file_url: newContract.fileUrl,
        expires_at:
          newContract.expiresAt || addDays(new Date(), 30).toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    if (data) {
      const contract = mapContract(data)
      setContracts((prev) => [contract, ...prev])
      return contract.id
    }
    return ''
  }

  const updateContractStatus = async (id: string, status: ContractStatus) => {
    const { data, error } = await supabase
      .from('contracts')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (data) {
      const contract = mapContract(data)
      setContracts((prev) => prev.map((c) => (c.id === id ? contract : c)))

      if (status === 'Signed') {
        const lead = leads.find((l) => l.id === contract.leadId)
        const clientName = lead ? lead.company : 'Cliente'
        toast({
          title: 'Contrato Assinado!',
          description: `Sucesso: O contrato para ${clientName} foi assinado!`,
        })
        addNotification(
          `Contrato "${contract.name}" assinado por ${clientName}`,
        )
      }
    }
  }

  const deleteContract = async (id: string) => {
    const { error } = await supabase.from('contracts').delete().eq('id', id)
    if (error) throw error
    setContracts((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <ContractsContext.Provider
      value={{ contracts, addContract, updateContractStatus, deleteContract }}
    >
      {children}
    </ContractsContext.Provider>
  )
}

export function useContracts() {
  const context = useContext(ContractsContext)
  if (context === undefined) {
    throw new Error('useContracts must be used within a ContractsProvider')
  }
  return context
}
