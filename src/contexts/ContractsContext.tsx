import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Contract {
  id: string
  lead_id: string
  name: string
  status: string
  uploaded_by: string | null
  uploaded_by_name: string | null
  file_url: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  vigencia?: string
  objeto?: string
  data_inicio?: string
  data_termino?: string
  nome_gestor?: string
  telefone_gestor?: string
  leads?: { name: string; company?: string }
}

interface ContractsContextType {
  contracts: Contract[]
  isLoading: boolean
  fetchContracts: () => Promise<void>
  addContract: (contract: Partial<Contract>) => Promise<void>
  updateContract: (id: string, updates: Partial<Contract>) => Promise<void>
  deleteContract: (id: string) => Promise<void>
}

const ContractsContext = createContext<ContractsContextType | undefined>(
  undefined,
)

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchContracts = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*, leads(name, company)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setContracts(data || [])
    } catch (error: any) {
      console.error('Error fetching contracts:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os contratos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [user])

  const addContract = async (contract: Partial<Contract>) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .insert([contract as any])
        .select('*, leads(name, company)')
        .single()

      if (error) throw error
      setContracts((prev) => [data, ...prev])
      toast({ title: 'Sucesso', description: 'Contrato adicionado.' })
    } catch (error: any) {
      console.error('Error adding contract:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao adicionar contrato.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update(updates as any)
        .eq('id', id)
        .select('*, leads(name, company)')
        .single()

      if (error) throw error
      setContracts((prev) => prev.map((c) => (c.id === id ? data : c)))
      toast({ title: 'Sucesso', description: 'Contrato atualizado.' })
    } catch (error: any) {
      console.error('Error updating contract:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar contrato.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const deleteContract = async (id: string) => {
    try {
      const { error } = await supabase.from('contracts').delete().eq('id', id)
      if (error) throw error
      setContracts((prev) => prev.filter((c) => c.id !== id))
      toast({ title: 'Sucesso', description: 'Contrato excluído.' })
    } catch (error: any) {
      console.error('Error deleting contract:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao excluir contrato.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const value = useMemo(
    () => ({
      contracts,
      isLoading,
      fetchContracts,
      addContract,
      updateContract,
      deleteContract,
    }),
    [contracts, isLoading],
  )

  return (
    <ContractsContext.Provider value={value}>
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
