import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
}

interface TemplatesContextType {
  templates: EmailTemplate[]
  addTemplate: (t: Omit<EmailTemplate, 'id'>) => void
  updateTemplate: (id: string, t: Partial<EmailTemplate>) => void
  deleteTemplate: (id: string) => void
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(
  undefined,
)

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem('@neutrowaste:templates')
    if (saved) return JSON.parse(saved)
    return [
      {
        id: 'tmpl1',
        name: 'Apresentação Neutrowaste',
        subject: 'Apresentação da Neutrowaste para {{company_name}}',
        body: 'Olá {{contact_name}},\n\nSomos da Neutrowaste. Gostaríamos de conversar sobre como podemos otimizar a gestão de resíduos da {{company_name}} e gerar economia.\n\nQualquer dúvida, estou à disposição.\n\nAtenciosamente.',
      },
    ]
  })

  useEffect(() => {
    localStorage.setItem('@neutrowaste:templates', JSON.stringify(templates))
  }, [templates])

  const addTemplate = (t: Omit<EmailTemplate, 'id'>) => {
    setTemplates((prev) => [
      ...prev,
      { ...t, id: Math.random().toString(36).substring(2, 9) },
    ])
  }

  const updateTemplate = (id: string, t: Partial<EmailTemplate>) => {
    setTemplates((prev) =>
      prev.map((tpl) => (tmpl.id === id ? { ...tpl, ...t } : tpl)),
    )
  }

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((tpl) => tpl.id !== id))
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
