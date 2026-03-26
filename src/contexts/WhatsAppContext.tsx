import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'

export interface WhatsAppTemplate {
  id: string
  name: string
  text: string
}

interface WhatsAppContextType {
  waTemplates: WhatsAppTemplate[]
  addWaTemplate: (t: Omit<WhatsAppTemplate, 'id'>) => Promise<void>
  updateWaTemplate: (id: string, t: Partial<WhatsAppTemplate>) => Promise<void>
  deleteWaTemplate: (id: string) => Promise<void>
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(
  undefined,
)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [waTemplates, setWaTemplates] = useState<WhatsAppTemplate[]>([])

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase.from('whatsapp_templates').select('*')
      if (data) setWaTemplates(data as WhatsAppTemplate[])
    }
    fetchTemplates()
  }, [])

  const addWaTemplate = async (t: Omit<WhatsAppTemplate, 'id'>) => {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .insert(t)
      .select()
      .single()

    if (!error && data) {
      setWaTemplates((prev) => [...prev, data as WhatsAppTemplate])
    }
  }

  const updateWaTemplate = async (id: string, t: Partial<WhatsAppTemplate>) => {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .update(t)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setWaTemplates((prev) =>
        prev.map((tmpl) => (tmpl.id === id ? data : tmpl)),
      )
    }
  }

  const deleteWaTemplate = async (id: string) => {
    const { error } = await supabase
      .from('whatsapp_templates')
      .delete()
      .eq('id', id)
    if (!error) {
      setWaTemplates((prev) => prev.filter((tmpl) => tmpl.id !== id))
    }
  }

  return (
    <WhatsAppContext.Provider
      value={{ waTemplates, addWaTemplate, updateWaTemplate, deleteWaTemplate }}
    >
      {children}
    </WhatsAppContext.Provider>
  )
}

export function useWhatsApp() {
  const context = useContext(WhatsAppContext)
  if (!context)
    throw new Error('useWhatsApp must be used within WhatsAppProvider')
  return context
}
