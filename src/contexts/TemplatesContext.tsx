import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
}

interface TemplatesContextType {
  templates: EmailTemplate[]
  addTemplate: (t: Omit<EmailTemplate, 'id'>) => Promise<void>
  updateTemplate: (id: string, t: Partial<EmailTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(
  undefined,
)

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase.from('email_templates').select('*')
      if (data) setTemplates(data as EmailTemplate[])
    }
    fetchTemplates()
  }, [])

  const addTemplate = async (t: Omit<EmailTemplate, 'id'>) => {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name: t.name,
        subject: t.subject,
        body: t.body,
      })
      .select()
      .single()

    if (!error && data) {
      setTemplates((prev) => [...prev, data as EmailTemplate])
    }
  }

  const updateTemplate = async (id: string, t: Partial<EmailTemplate>) => {
    const { data, error } = await supabase
      .from('email_templates')
      .update(t)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setTemplates((prev) => prev.map((tpl) => (tpl.id === id ? data : tpl)))
    }
  }

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)
    if (!error) {
      setTemplates((prev) => prev.filter((tpl) => tpl.id !== id))
    }
  }

  return (
    <TemplatesContext.Provider
      value={{ templates, addTemplate, updateTemplate, deleteTemplate }}
    >
      {children}
    </TemplatesContext.Provider>
  )
}

export function useTemplates() {
  const context = useContext(TemplatesContext)
  if (!context)
    throw new Error('useTemplates must be used within TemplatesProvider')
  return context
}
