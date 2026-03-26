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
  isOnline?: boolean
}

interface AuthContextType {
  user: User | null
  allUsers: User[]
  isLoading: boolean
  login: (email: string, pass: string) => Promise<User>
  register: (
    name: string,
    email: string,
    pass: string,
    role: 'Admin' | 'Seller',
  ) => Promise<void>
  logout: () => void
  finalizeLogin: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const defaultUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@neutrowaste.com',
    role: 'Admin',
    isOnline: true,
  },
  {
    id: 'seller-1',
    name: 'Vendedor',
    email: 'vendedor@neutrowaste.com',
    role: 'Seller',
    isOnline: false,
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
        const u = JSON.parse(storedUser)
        setUser({ ...u, isOnline: true })
      } catch (e) {
        console.error(e)
      }
    }

    const storedUsers = localStorage.getItem('@neutrowaste:users')
    let parsedUsers = storedUsers ? JSON.parse(storedUsers) : []

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
        isOnline:
          u.id === 'admin-1' || u.id === 'seller-1'
            ? u.isOnline
            : Math.random() > 0.5,
      })),
    )
    setIsLoading(false)

    const handleBeforeUnload = () => {
      // Logic to set offline could go here for backend sync
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const login = async (email: string, pass: string): Promise<User> => {
    const usersStr = localStorage.getItem('@neutrowaste:users')
    const users = usersStr ? JSON.parse(usersStr) : []

    if (email === 'admin@neutrowaste.com' && pass === 'admin123') {
      return defaultUsers[0]
    }

    if (email === 'vendedor@neutrowaste.com' && pass === 'vendedor123') {
      return defaultUsers[1]
    }

    const found = users.find(
      (u: any) => u.email === email && u.password === pass,
    )

    if (!found) {
      throw new Error('E-mail ou senha inválidos.')
    }

    return {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role || 'Seller',
      isOnline: true,
    }
  }

  const finalizeLogin = (loggedInUser: User) => {
    const userWithOnline = { ...loggedInUser, isOnline: true }
    setUser(userWithOnline)
    localStorage.setItem('@neutrowaste:user', JSON.stringify(userWithOnline))
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userWithOnline.id ? { ...u, isOnline: true } : u,
      ),
    )
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
        isOnline: u.id === newUser.id ? true : false,
      })),
    )

    const loggedUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'Admin' | 'Seller',
      isOnline: true,
    }
    finalizeLogin(loggedUser)
  }

  const logout = () => {
    if (user) {
      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isOnline: false } : u)),
      )
    }
    setUser(null)
    localStorage.removeItem('@neutrowaste:user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        isLoading,
        login,
        register,
        logout,
        finalizeLogin,
      }}
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
