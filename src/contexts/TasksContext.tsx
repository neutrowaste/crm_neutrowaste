import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

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
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleComplete: (id: string) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('@neutrowaste:tasks')
    if (saved) return JSON.parse(saved)
    return [
      {
        id: 't1',
        leadId: '1',
        title: 'Ligação de acompanhamento',
        dueDate: new Date().toISOString().split('T')[0],
        time: '09:00',
        description: 'Falar sobre a proposta',
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]
  })

  useEffect(() => {
    localStorage.setItem('@neutrowaste:tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    setTasks((prev) => [
      {
        ...task,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...taskData } : t)),
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
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
