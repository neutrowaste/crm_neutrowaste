import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

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

  useEffect(() => {
    localStorage.setItem('@neutrowaste:contracts', JSON.stringify(contracts))
  }, [contracts])

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
      prev.map((c) =>
        c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c,
      ),
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
