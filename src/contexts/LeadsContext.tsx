import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'
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
  lastFollowUp?: string
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
  addLead: (
    lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<string>
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>
  removeLead: (id: string) => Promise<void>
  markNotificationsAsRead: () => void
  addNotification: (message: string) => void
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

const mapLead = (data: any): Lead => ({
  id: data.id,
  name: data.name,
  company: data.company,
  email: data.email,
  phone: data.phone || undefined,
  status: data.status,
  source: data.source,
  value: data.value,
  industry: data.industry || undefined,
  notes: data.notes || undefined,
  assignedTo: data.assigned_to || undefined,
  lastFollowUp: data.last_follow_up || undefined,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('@neutrowaste:notifications')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setLeads(data.map(mapLead))
    }
    fetchLeads()

    const channel = supabase
      .channel('public:leads')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          fetchLeads()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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

  const addLead = async (
    newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: newLead.name,
        company: newLead.company,
        email: newLead.email,
        phone: newLead.phone,
        status: newLead.status,
        source: newLead.source,
        value: newLead.value,
        industry: newLead.industry,
        notes: newLead.notes,
        assigned_to: newLead.assignedTo,
      })
      .select()
      .single()

    if (error) throw error
    if (data) {
      const lead = mapLead(data)
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
      return lead.id
    }
    return ''
  }

  const updateLead = async (id: string, updatedData: Partial<Lead>) => {
    const payload: any = {}
    if (updatedData.name !== undefined) payload.name = updatedData.name
    if (updatedData.company !== undefined) payload.company = updatedData.company
    if (updatedData.email !== undefined) payload.email = updatedData.email
    if (updatedData.phone !== undefined) payload.phone = updatedData.phone
    if (updatedData.status !== undefined) payload.status = updatedData.status
    if (updatedData.source !== undefined) payload.source = updatedData.source
    if (updatedData.value !== undefined) payload.value = updatedData.value
    if (updatedData.industry !== undefined)
      payload.industry = updatedData.industry
    if (updatedData.notes !== undefined) payload.notes = updatedData.notes
    if (updatedData.assignedTo !== undefined)
      payload.assigned_to = updatedData.assignedTo
    if (updatedData.lastFollowUp !== undefined)
      payload.last_follow_up = updatedData.lastFollowUp

    payload.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('leads')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (data) {
      const lead = mapLead(data)
      setLeads((prev) => prev.map((l) => (l.id === id ? lead : l)))

      if (updatedData.status) {
        addNotification(`Status do lead ${lead.name} alterado`)
      }
    }
  }

  const removeLead = async (id: string) => {
    const leadToRemove = leads.find((l) => l.id === id)
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) throw error

    if (leadToRemove) {
      addNotification(`Lead ${leadToRemove.name} foi removido`)
    }
    setLeads((prev) => prev.filter((lead) => lead.id !== id))
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
        addNotification,
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
