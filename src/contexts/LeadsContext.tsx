import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { calculateLeadScore, sendBrowserNotification } from '@/lib/utils'

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
  assignedTo?: string
  createdAt: string
  updatedAt: string
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
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => string
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
    assignedTo: 'admin-1',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: new Date().toISOString(),
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
    assignedTo: 'seller-1',
    createdAt: '2024-03-21T14:30:00Z',
    updatedAt: '2024-03-21T14:30:00Z',
  },
  {
    id: '3',
    name: 'Mariana Costa',
    company: 'Agile Systems',
    email: 'mariana@agilesystems.com',
    status: 'Proposta',
    source: 'Ligação',
    value: 25000,
    assignedTo: 'seller-1',
    createdAt: '2024-03-18T09:15:00Z',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
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
    assignedTo: 'admin-1',
    createdAt: '2024-03-22T11:45:00Z',
    updatedAt: '2024-03-22T11:45:00Z',
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
    assignedTo: 'admin-1',
    createdAt: '2024-03-15T16:20:00Z',
    updatedAt: '2024-03-15T16:20:00Z',
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

  const addLead = (newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const lead: Lead = {
      ...newLead,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setLeads((prev) => [lead, ...prev])
    addNotification(`Novo lead: ${lead.name} cadastrado`)

    const score = calculateLeadScore(lead)
    if (score >= 80) {
      sendBrowserNotification('🚀 Lead Quente!', {
        body: `O lead ${lead.name} foi criado com score alto (${score})!`,
      })
      addNotification(
        `Atenção: Novo lead ${lead.name} com Score Alto (${score})`,
      )
    }

    return id
  }

  const updateLead = (id: string, updatedData: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          const updatedLead = {
            ...lead,
            ...updatedData,
            updatedAt: new Date().toISOString(),
          }

          if (updatedData.status && lead.status !== updatedData.status) {
            addNotification(
              `Status do lead ${lead.name} alterado para ${updatedData.status}`,
            )
          }

          const oldScore = calculateLeadScore(lead)
          const newScore = calculateLeadScore(updatedLead)

          if (oldScore < 80 && newScore >= 80) {
            sendBrowserNotification('🔥 Lead Aqueceu!', {
              body: `O lead ${lead.name} atingiu um score alto (${newScore})!`,
            })
            addNotification(
              `Lead ${lead.name} atingiu Score Alto (${newScore})!`,
            )
          }

          return updatedLead
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
