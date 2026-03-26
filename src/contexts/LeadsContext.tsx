import { createContext, useContext, useState, ReactNode } from 'react'

export interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  status: 'Novo' | 'Contatado' | 'Qualificado' | 'Proposta' | 'Ganho'
  source: 'Site' | 'Indicação' | 'Ligação' | 'Evento'
  value?: number
  industry?: string
  notes?: string
  createdAt: string
}

interface LeadsContextType {
  leads: Lead[]
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void
  updateLead: (id: string, lead: Partial<Lead>) => void
  removeLead: (id: string) => void
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Ana Oliveira',
    company: 'Tech Solutions',
    email: 'ana@techsolutions.com',
    status: 'Qualificado',
    source: 'Site',
    value: 15000,
    createdAt: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    name: 'Carlos Santos',
    company: 'Global Innovations',
    email: 'carlos@globalinnovations.com',
    status: 'Novo',
    source: 'Indicação',
    value: 8000,
    createdAt: '2024-03-21T14:30:00Z',
  },
  {
    id: '3',
    name: 'Mariana Costa',
    company: 'Agile Systems',
    email: 'mariana@agilesystems.com',
    status: 'Proposta',
    source: 'Ligação',
    value: 25000,
    createdAt: '2024-03-18T09:15:00Z',
  },
  {
    id: '4',
    name: 'Roberto Almeida',
    company: 'NexGen Corp',
    email: 'roberto@nexgen.com',
    status: 'Contatado',
    source: 'Evento',
    value: 12000,
    createdAt: '2024-03-22T11:45:00Z',
  },
  {
    id: '5',
    name: 'Fernanda Lima',
    company: 'DataTech',
    email: 'fernanda@datatech.com',
    status: 'Ganho',
    source: 'Site',
    value: 45000,
    createdAt: '2024-03-15T16:20:00Z',
  },
]

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)

  const addLead = (newLead: Omit<Lead, 'id' | 'createdAt'>) => {
    const lead: Lead = {
      ...newLead,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    setLeads((prev) => [lead, ...prev])
  }

  const updateLead = (id: string, updatedData: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...updatedData } : lead)),
    )
  }

  const removeLead = (id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id))
  }

  return (
    <LeadsContext.Provider value={{ leads, addLead, updateLead, removeLead }}>
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeads() {
  const context = useContext(LeadsContext)
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadsProvider')
  }
  return context
}
