import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

export interface WhatsAppTemplate {
  id: string
  name: string
  text: string
}

interface WhatsAppContextType {
  waTemplates: WhatsAppTemplate[]
  addWaTemplate: (t: Omit<WhatsAppTemplate, 'id'>) => void
  updateWaTemplate: (id: string, t: Partial<WhatsAppTemplate>) => void
  deleteWaTemplate: (id: string) => void
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(
  undefined,
)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [waTemplates, setWaTemplates] = useState<WhatsAppTemplate[]>(() => {
    const saved = localStorage.getItem('@neutrowaste:watemplates')
    if (saved) return JSON.parse(saved)
    return [
      {
        id: 'wa1',
        name: 'Primeiro Contato (Abordagem)',
        text: 'Olá {{lead_name}}, tudo bem? Sou da Neutrowaste e vi que a {{company_name}} está buscando otimizar sua gestão de resíduos. Podemos agendar um bate-papo rápido?',
      },
      {
        id: 'wa2',
        name: 'Acompanhamento (Follow-up)',
        text: 'Oi {{lead_name}}, passando para saber se você conseguiu analisar a proposta que enviamos para a {{company_name}}. Qualquer dúvida estou à disposição!',
      },
    ]
  })

  useEffect(() => {
    localStorage.setItem(
      '@neutrowaste:watemplates',
      JSON.stringify(waTemplates),
    )
  }, [waTemplates])

  const addWaTemplate = (t: Omit<WhatsAppTemplate, 'id'>) => {
    setWaTemplates((prev) => [
      ...prev,
      { ...t, id: Math.random().toString(36).substring(2, 9) },
    ])
  }

  const updateWaTemplate = (id: string, t: Partial<WhatsAppTemplate>) => {
    setWaTemplates((prev) =>
      prev.map((tmpl) => (tmpl.id === id ? { ...tmpl, ...t } : tmpl)),
    )
  }

  const deleteWaTemplate = (id: string) => {
    setWaTemplates((prev) => prev.filter((tmpl) => tmpl.id !== id))
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
