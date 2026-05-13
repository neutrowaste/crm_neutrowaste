import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Log {
  id: string
  user_id: string | null
  user_name: string
  action: string
  lead_id: string | null
  lead_name: string
  details: string
  timestamp: string
}

interface LogsContextType {
  logs: Log[]
  isLoading: boolean
  fetchLogs: () => Promise<void>
  addLog: (log: Partial<Log>) => Promise<void>
}

const LogsContext = createContext<LogsContextType | undefined>(undefined)

export function LogsProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchLogs = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false })

      if (error) throw error
      setLogs(data || [])
    } catch (error: any) {
      console.error('Error fetching logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [user])

  const addLog = async (log: Partial<Log>) => {
    try {
      const payload: any = {
        ...log,
        timestamp: new Date().toISOString(),
      }

      if ('userId' in payload) {
        payload.user_id = payload.userId
        delete payload.userId
      }
      if ('userName' in payload) {
        payload.user_name = payload.userName
        delete payload.userName
      }
      if ('leadId' in payload) {
        payload.lead_id = payload.leadId
        delete payload.leadId
      }
      if ('leadName' in payload) {
        payload.lead_name = payload.leadName
        delete payload.leadName
      }

      const { data, error } = await supabase
        .from('logs')
        .insert([payload])
        .select()
        .single()

      if (error) throw error
      setLogs((prev) => [data, ...prev])
    } catch (error: any) {
      console.error('Error adding log:', error)
      throw error
    }
  }

  const value = useMemo(
    () => ({
      logs,
      isLoading,
      fetchLogs,
      addLog,
    }),
    [logs, isLoading],
  )

  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>
}

export function useLogs() {
  const context = useContext(LogsContext)
  if (context === undefined) {
    throw new Error('useLogs must be used within a LogsProvider')
  }
  return context
}
