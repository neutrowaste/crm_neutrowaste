import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface AutomationsContextType {
  emailOnProposal: boolean
  setEmailOnProposal: (val: boolean) => void
  taskOnWon: boolean
  setTaskOnWon: (val: boolean) => void
}

const AutomationsContext = createContext<AutomationsContextType | undefined>(
  undefined,
)

export function AutomationsProvider({ children }: { children: ReactNode }) {
  const [emailOnProposal, setEmailOnProposal] = useState<boolean>(() => {
    const saved = localStorage.getItem('@neutrowaste:auto_emailOnProposal')
    return saved ? JSON.parse(saved) : false
  })

  const [taskOnWon, setTaskOnWon] = useState<boolean>(() => {
    const saved = localStorage.getItem('@neutrowaste:auto_taskOnWon')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem(
      '@neutrowaste:auto_emailOnProposal',
      JSON.stringify(emailOnProposal),
    )
  }, [emailOnProposal])

  useEffect(() => {
    localStorage.setItem(
      '@neutrowaste:auto_taskOnWon',
      JSON.stringify(taskOnWon),
    )
  }, [taskOnWon])

  return (
    <AutomationsContext.Provider
      value={{
        emailOnProposal,
        setEmailOnProposal,
        taskOnWon,
        setTaskOnWon,
      }}
    >
      {children}
    </AutomationsContext.Provider>
  )
}

export function useAutomations() {
  const context = useContext(AutomationsContext)
  if (!context) {
    throw new Error('useAutomations must be used within an AutomationsProvider')
  }
  return context
}
