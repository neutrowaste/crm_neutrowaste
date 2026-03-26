import React, { createContext, useContext, useState, ReactNode } from 'react'

export type LeadStatus = 'Prospect' | 'Qualified' | 'Proposal' | 'Closed'

export interface Lead {
  id: string
  company: string
  industry: string
  contact: string
  email: string
  phone: string
  source: string
  status: LeadStatus
  createdAt: Date
}

interface LeadsContextType {
  leads: Lead[]
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void
  updateLead: (id: string, lead: Partial<Lead>) => void
  deleteLead: (id: string) => void
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

const initialLeads: Lead[] = [
  {
    id: '1',
    company: 'Green Future Mfg',
    industry: 'Manufacturing',
    contact: 'Robert Plant',
    email: 'robert@greenfuture.com',
    phone: '(555) 123-4567',
    source: 'Website',
    status: 'Prospect',
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: '2',
    company: 'City Waste Dept',
    industry: 'Government',
    contact: 'Leslie Knope',
    email: 'lknope@pawnee.gov',
    phone: '(555) 987-6543',
    source: 'Referral',
    status: 'Proposal',
    createdAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: '3',
    company: 'EcoDine Restaurants',
    industry: 'Hospitality',
    contact: 'Gordon Ramsey',
    email: 'gramsey@ecodine.com',
    phone: '(555) 555-5555',
    source: 'Trade Show',
    status: 'Qualified',
    createdAt: new Date(Date.now() - 86400000 * 10),
  },
]

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    setLeads((prev) => [newLead, ...prev])
  }

  const updateLead = (id: string, updatedData: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...updatedData } : lead)),
    )
  }

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id))
  }

  return (
    <LeadsContext.Provider value={{ leads, addLead, updateLead, deleteLead }}>
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
