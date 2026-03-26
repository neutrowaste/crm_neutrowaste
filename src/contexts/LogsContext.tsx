import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Log {
  id: string
  userId: string
  userName: string
  action: string
  leadId: string
  leadName: string
  details: string
  timestamp: string
}

interface LogsContextType {
  logs: Log[]
  addLog: (log: Omit<Log, 'id' | 'timestamp'>) => Promise<void>
}

const LogsContext = createContext<LogsContextType | undefined>(undefined)

const mapLog = (data: any): Log => ({
  id: data.id,
  userId: data.user_id || 'system',
  userName: data.user_name,
  action: data.action,
  leadId: data.lead_id || '',
  leadName: data.lead_name,
  details: data.details,
  timestamp: data.timestamp || data.created_at,
})

export function LogsProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false })
      if (data) setLogs(data.map(mapLog))
    }
    fetchLogs()
  }, [])

  const addLog = async (log: Omit<Log, 'id' | 'timestamp'>) => {
    const { data, error } = await supabase
      .from('logs')
      .insert({
        user_id:
          log.userId !== 'system' && log.userId !== 'customer'
            ? log.userId
            : null,
        user_name: log.userName,
        action: log.action,
        lead_id: log.leadId || null,
        lead_name: log.leadName,
        details: log.details,
      })
      .select()
      .single()

    if (!error && data) {
      setLogs((prev) => [mapLog(data), ...prev])
    }
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
