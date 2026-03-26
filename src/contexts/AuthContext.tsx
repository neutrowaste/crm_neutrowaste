import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Seller'
}

interface AuthContextType {
  user: User | null
  allUsers: User[]
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (
    name: string,
    email: string,
    pass: string,
    role: 'Admin' | 'Seller',
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const defaultUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@neutrowaste.com',
    role: 'Admin',
  },
  {
    id: 'seller-1',
    name: 'Vendedor',
    email: 'vendedor@neutrowaste.com',
    role: 'Seller',
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('@neutrowaste:user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error(e)
      }
    }

    const storedUsers = localStorage.getItem('@neutrowaste:users')
    let parsedUsers = storedUsers ? JSON.parse(storedUsers) : []

    // Ensure default users exist in allUsers list
    const defaultsToAdd = defaultUsers.filter(
      (du) => !parsedUsers.some((pu: any) => pu.email === du.email),
    )
    if (defaultsToAdd.length > 0) {
      parsedUsers = [...parsedUsers, ...defaultsToAdd]
      localStorage.setItem('@neutrowaste:users', JSON.stringify(parsedUsers))
    }

    setAllUsers(
      parsedUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    )
    setIsLoading(false)
  }, [])

  const login = async (email: string, pass: string) => {
    const usersStr = localStorage.getItem('@neutrowaste:users')
    const users = usersStr ? JSON.parse(usersStr) : []

    // Default mock users for testing
    if (email === 'admin@neutrowaste.com' && pass === 'admin123') {
      const adminUser = defaultUsers[0]
      setUser(adminUser)
      localStorage.setItem('@neutrowaste:user', JSON.stringify(adminUser))
      return
    }

    if (email === 'vendedor@neutrowaste.com' && pass === 'vendedor123') {
      const sellerUser = defaultUsers[1]
      setUser(sellerUser)
      localStorage.setItem('@neutrowaste:user', JSON.stringify(sellerUser))
      return
    }

    const found = users.find(
      (u: any) => u.email === email && u.password === pass,
    )

    if (!found) {
      throw new Error('E-mail ou senha inválidos.')
    }

    const loggedUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role || 'Seller',
    }
    setUser(loggedUser)
    localStorage.setItem('@neutrowaste:user', JSON.stringify(loggedUser))
  }

  const register = async (
    name: string,
    email: string,
    pass: string,
    role: 'Admin' | 'Seller',
  ) => {
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
      role,
    }

    const updatedUsers = [...users, newUser]
    localStorage.setItem('@neutrowaste:users', JSON.stringify(updatedUsers))
    setAllUsers(
      updatedUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    )

    const loggedUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'Admin' | 'Seller',
    }
    setUser(loggedUser)
    localStorage.setItem('@neutrowaste:user', JSON.stringify(loggedUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('@neutrowaste:user')
  }

  return (
    <AuthContext.Provider
      value={{ user, allUsers, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
