import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import { sendBrowserNotification } from '@/lib/utils'

export interface Task {
  id: string
  leadId: string
  title: string
  dueDate: string
  time: string
  description?: string
  completed: boolean
  createdAt: string
}

interface TasksContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

const mapTask = (data: any): Task => ({
  id: data.id,
  leadId: data.lead_id,
  title: data.title,
  dueDate: data.due_date,
  time: data.time,
  description: data.description || undefined,
  completed: data.completed,
  createdAt: data.created_at,
})

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const notifiedTasks = useRef<Set<string>>(new Set())

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase.from('tasks').select('*')
      if (data) setTasks(data.map(mapTask))
    }
    fetchTasks()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      tasks.forEach((task) => {
        if (task.completed || notifiedTasks.current.has(task.id)) return
        try {
          const taskDate = new Date(`${task.dueDate}T${task.time}:00`)
          const diffMs = taskDate.getTime() - now.getTime()
          const diffMins = diffMs / 1000 / 60

          if (diffMins > 0 && diffMins <= 15) {
            sendBrowserNotification('⏰ Lembrete de Tarefa', {
              body: `A tarefa "${task.title}" está agendada para daqui a ${Math.ceil(diffMins)} minutos.`,
            })
            notifiedTasks.current.add(task.id)
          }
        } catch (e) {}
      })
    }, 60000)

    return () => clearInterval(interval)
  }, [tasks])

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        lead_id: task.leadId,
        title: task.title,
        due_date: task.dueDate,
        time: task.time,
        description: task.description,
        completed: task.completed,
      })
      .select()
      .single()

    if (!error && data) {
      setTasks((prev) => [...prev, mapTask(data)])
    }
  }

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    const payload: any = {}
    if (taskData.title !== undefined) payload.title = taskData.title
    if (taskData.dueDate !== undefined) payload.due_date = taskData.dueDate
    if (taskData.time !== undefined) payload.time = taskData.time
    if (taskData.description !== undefined)
      payload.description = taskData.description
    if (taskData.completed !== undefined) payload.completed = taskData.completed

    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setTasks((prev) => prev.map((t) => (t.id === id ? mapTask(data) : t)))
    }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const toggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (task) {
      await updateTask(id, { completed: !task.completed })
    }
  }

  return (
    <TasksContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, toggleComplete }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) throw new Error('useTasks must be used within TasksProvider')
  return context
}
