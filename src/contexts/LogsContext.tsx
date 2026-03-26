import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

export interface Log {
  id: string
  userId: string
  userName: string
  action: 'Criar' | 'Atualizar' | 'Excluir'
  leadId: string
  leadName: string
  details: string
  timestamp: string
}

interface LogsContextType {
  logs: Log[]
  addLog: (log: Omit<Log, 'id' | 'timestamp'>) => void
}

const LogsContext = createContext<LogsContextType | undefined>(undefined)

export function LogsProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<Log[]>(() => {
    const saved = localStorage.getItem('@neutrowaste:logs')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('@neutrowaste:logs', JSON.stringify(logs))
  }, [logs])

  const addLog = (log: Omit<Log, 'id' | 'timestamp'>) => {
    setLogs((prev) => [
      {
        ...log,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  return (
    <LogsContext.Provider value={{ logs, addLog }}>
      {children}
    </LogsContext.Provider>
  )
}

export function useLogs() {
  const context = useContext(LogsContext)
  if (!context) throw new Error('useLogs must be used within LogsProvider')
  return context
}
