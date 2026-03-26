import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react'
import { useToast } from '@/hooks/use-toast'
import { useLeads } from '@/contexts/LeadsContext'

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
}

interface ContractsContextType {
  contracts: Contract[]
  addContract: (
    contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>,
  ) => string
  updateContractStatus: (id: string, status: ContractStatus) => void
  deleteContract: (id: string) => void
}

const mockContracts: Contract[] = [
  {
    id: 'c1',
    leadId: '1',
    name: 'Proposta Comercial - Tech Solutions',
    status: 'Sent for Signature',
    uploadedBy: 'admin-1',
    uploadedByName: 'Administrador',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    fileUrl: '#',
  },
  {
    id: 'c2',
    leadId: '3',
    name: 'Contrato de Prestação de Serviços - Agile Systems',
    status: 'Signed',
    uploadedBy: 'seller-1',
    uploadedByName: 'Vendedor',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    fileUrl: '#',
  },
]

const ContractsContext = createContext<ContractsContextType | undefined>(
  undefined,
)

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem('@neutrowaste:contracts')
    return saved ? JSON.parse(saved) : mockContracts
  })

  const { toast } = useToast()
  const { leads, addNotification } = useLeads()
  const prevContractsRef = useRef<Contract[]>(contracts)

  useEffect(() => {
    localStorage.setItem('@neutrowaste:contracts', JSON.stringify(contracts))
    prevContractsRef.current = contracts
  }, [contracts])

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === '@neutrowaste:contracts' && e.newValue) {
        try {
          const newContracts: Contract[] = JSON.parse(e.newValue)
          const signedNewly = newContracts.filter(
            (c) =>
              c.status === 'Signed' &&
              prevContractsRef.current.find(
                (pc) => pc.id === c.id && pc.status !== 'Signed',
              ),
          )

          signedNewly.forEach((c) => {
            const lead = leads.find((l) => l.id === c.leadId)
            const clientName = lead ? lead.company : 'Cliente'
            toast({
              title: 'Contrato Assinado!',
              description: `Sucesso: O contrato para ${clientName} foi assinado!`,
            })
          })

          setContracts(newContracts)
          prevContractsRef.current = newContracts
        } catch (err) {
          // Ignore JSON parse errors
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [leads, toast])

  const addContract = (
    newContract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const contract: Contract = {
      ...newContract,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setContracts((prev) => [contract, ...prev])
    return id
  }

  const updateContractStatus = (id: string, status: ContractStatus) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (status === 'Signed' && c.status !== 'Signed') {
            const lead = leads.find((l) => l.id === c.leadId)
            const clientName = lead ? lead.company : 'Cliente'
            toast({
              title: 'Contrato Assinado!',
              description: `Sucesso: O contrato para ${clientName} foi assinado!`,
            })
            addNotification(`Contrato "${c.name}" assinado por ${clientName}`)
          }
          return { ...c, status, updatedAt: new Date().toISOString() }
        }
        return c
      }),
    )
  }

  const deleteContract = (id: string) => {
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
