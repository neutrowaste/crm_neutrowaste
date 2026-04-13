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

export interface ContractTemplate {
  id: string
  name: string
  description?: string
  file_url: string
}

interface TemplatesContextType {
  templates: EmailTemplate[]
  addTemplate: (t: Omit<EmailTemplate, 'id'>) => Promise<void>
  updateTemplate: (id: string, t: Partial<EmailTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>

  contractTemplates: ContractTemplate[]
  addContractTemplate: (
    t: Omit<ContractTemplate, 'id' | 'file_url'>,
    file: File,
  ) => Promise<void>
  updateContractTemplate: (
    id: string,
    t: Partial<ContractTemplate>,
    file?: File,
  ) => Promise<void>
  deleteContractTemplate: (id: string) => Promise<void>
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(
  undefined,
)

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [contractTemplates, setContractTemplates] = useState<
    ContractTemplate[]
  >([])

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase.from('email_templates').select('*')
      if (data) setTemplates(data as EmailTemplate[])
    }

    const fetchContractTemplates = async () => {
      const { data } = await supabase
        .from('contract_templates')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setContractTemplates(data as ContractTemplate[])
    }

    fetchTemplates()
    fetchContractTemplates()
  }, [])

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `templates/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('contracts').getPublicUrl(filePath)
    return data.publicUrl
  }

  const addContractTemplate = async (
    t: Omit<ContractTemplate, 'id' | 'file_url'>,
    file: File,
  ) => {
    const fileUrl = await uploadFile(file)
    const { data, error } = await supabase
      .from('contract_templates')
      .insert({
        name: t.name,
        description: t.description,
        file_url: fileUrl,
      })
      .select()
      .single()

    if (error) throw error
    if (data) {
      setContractTemplates((prev) => [data as ContractTemplate, ...prev])
    }
  }

  const updateContractTemplate = async (
    id: string,
    t: Partial<ContractTemplate>,
    file?: File,
  ) => {
    let fileUrl = t.file_url
    if (file) {
      fileUrl = await uploadFile(file)
    }

    const { data, error } = await supabase
      .from('contract_templates')
      .update({
        name: t.name,
        description: t.description,
        ...(fileUrl ? { file_url: fileUrl } : {}),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (data) {
      setContractTemplates((prev) =>
        prev.map((tpl) => (tpl.id === id ? (data as ContractTemplate) : tpl)),
      )
    }
  }

  const deleteContractTemplate = async (id: string) => {
    const { error } = await supabase
      .from('contract_templates')
      .delete()
      .eq('id', id)
    if (error) throw error
    setContractTemplates((prev) => prev.filter((tpl) => tpl.id !== id))
  }

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
      value={{
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        contractTemplates,
        addContractTemplate,
        updateContractTemplate,
        deleteContractTemplate,
      }}
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
