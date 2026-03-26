import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

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

export interface Notification {
  id: string
  message: string
  createdAt: string
  read: boolean
}

interface LeadsContextType {
  leads: Lead[]
  notifications: Notification[]
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void
  updateLead: (id: string, lead: Partial<Lead>) => void
  removeLead: (id: string) => void
  markNotificationsAsRead: () => void
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Ana Oliveira',
    company: 'Tech Solutions',
    email: 'ana@techsolutions.com',
    phone: '11999999999',
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
    phone: '11988888888',
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
    phone: '21977777777',
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
    phone: '31966666666',
    status: 'Ganho',
    source: 'Site',
    value: 45000,
    createdAt: '2024-03-15T16:20:00Z',
  },
]

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('@neutrowaste:leads')
    return saved ? JSON.parse(saved) : mockLeads
  })

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('@neutrowaste:notifications')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('@neutrowaste:leads', JSON.stringify(leads))
  }, [leads])

  useEffect(() => {
    localStorage.setItem(
      '@neutrowaste:notifications',
      JSON.stringify(notifications),
    )
  }, [notifications])

  const addNotification = (message: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      createdAt: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const addLead = (newLead: Omit<Lead, 'id' | 'createdAt'>) => {
    const lead: Lead = {
      ...newLead,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    setLeads((prev) => [lead, ...prev])
    addNotification(`Novo lead: ${lead.name} cadastrado`)
  }

  const updateLead = (id: string, updatedData: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          if (updatedData.status && lead.status !== updatedData.status) {
            addNotification(
              `Status do lead ${lead.name} alterado para ${updatedData.status}`,
            )
          }
          return { ...lead, ...updatedData }
        }
        return lead
      }),
    )
  }

  const removeLead = (id: string) => {
    setLeads((prev) => {
      const leadToRemove = prev.find((l) => l.id === id)
      if (leadToRemove) {
        addNotification(`Lead ${leadToRemove.name} foi removido`)
      }
      return prev.filter((lead) => lead.id !== id)
    })
  }

  return (
    <LeadsContext.Provider
      value={{
        leads,
        notifications,
        addLead,
        updateLead,
        removeLead,
        markNotificationsAsRead,
      }}
    >
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
