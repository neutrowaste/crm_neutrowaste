import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (name: string, email: string, pass: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('@neutrowaste:user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse user from local storage', e)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, pass: string) => {
    const usersStr = localStorage.getItem('@neutrowaste:users')
    const users = usersStr ? JSON.parse(usersStr) : []
    const found = users.find(
      (u: any) => u.email === email && u.password === pass,
    )

    if (!found) {
      throw new Error('E-mail ou senha inválidos.')
    }

    const loggedUser = { id: found.id, name: found.name, email: found.email }
    setUser(loggedUser)
    localStorage.setItem('@neutrowaste:user', JSON.stringify(loggedUser))
  }

  const register = async (name: string, email: string, pass: string) => {
    const usersStr = localStorage.getItem('@neutrowaste:users')
    const users = usersStr ? JSON.parse(usersStr) : []

    if (users.find((u: any) => u.email === email)) {
      throw new Error('E-mail já cadastrado.')
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: pass,
    }
    users.push(newUser)
    localStorage.setItem('@neutrowaste:users', JSON.stringify(users))

    const loggedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    }
    setUser(loggedUser)
    localStorage.setItem('@neutrowaste:user', JSON.stringify(loggedUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('@neutrowaste:user')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
