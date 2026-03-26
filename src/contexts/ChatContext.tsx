import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { sendBrowserNotification } from '@/lib/utils'

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: string
  leadId?: string
  readBy: string[]
  receiverId?: string
}

interface ChatContextType {
  messages: ChatMessage[]
  sendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp' | 'readBy'>) => void
  markAllAsRead: (userId: string, channelId?: string) => void
  getUnreadCount: (userId: string, channelId?: string) => number
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('@neutrowaste:chat')
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'msg1',
            userId: 'admin-1',
            userName: 'Administrador',
            text: 'Bem-vindos ao chat da equipe!',
            timestamp: new Date().toISOString(),
            readBy: ['admin-1'],
          },
        ]
  })

  useEffect(() => {
    localStorage.setItem('@neutrowaste:chat', JSON.stringify(messages))
  }, [messages])

  const sendMessage = (
    msg: Omit<ChatMessage, 'id' | 'timestamp' | 'readBy'>,
  ) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      readBy: [msg.userId],
    }
    setMessages((prev) => [...prev, newMsg])

    // Simulate push notification for others
    if (!msg.receiverId || msg.receiverId !== msg.userId) {
      sendBrowserNotification(`Nova mensagem de ${msg.userName}`, {
        body: msg.text,
      })
    }
  }

  const markAllAsRead = (userId: string, channelId?: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (!m.readBy.includes(userId)) {
          if (channelId) {
            const isGeneral = channelId === 'general' && !m.receiverId
            const isDM =
              channelId !== 'general' &&
              (m.userId === channelId || m.receiverId === channelId)

            if (isGeneral || isDM) {
              return { ...m, readBy: [...m.readBy, userId] }
            }
            return m
          }
          return { ...m, readBy: [...m.readBy, userId] }
        }
        return m
      }),
    )
  }

  const getUnreadCount = (userId: string, channelId?: string) => {
    return messages.filter((m) => {
      const isUnread = !m.readBy.includes(userId)
      if (!isUnread) return false

      if (channelId) {
        if (channelId === 'general') return !m.receiverId
        return m.userId === channelId || m.receiverId === channelId
      }

      // If no channel specified, just count messages directed to me or general
      return !m.receiverId || m.receiverId === userId
    }).length
  }

  return (
    <ChatContext.Provider
      value={{ messages, sendMessage, markAllAsRead, getUnreadCount }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat must be used within ChatProvider')
  return context
}
