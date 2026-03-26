import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'
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
  fileUrl?: string
  fileName?: string
}

interface ChatContextType {
  messages: ChatMessage[]
  sendMessage: (
    msg: Omit<ChatMessage, 'id' | 'timestamp' | 'readBy'>,
  ) => Promise<void>
  markAllAsRead: (userId: string, channelId?: string) => Promise<void>
  getUnreadCount: (userId: string, channelId?: string) => number
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const mapMsg = (data: any): ChatMessage => ({
  id: data.id,
  userId: data.user_id,
  userName: data.user_name,
  text: data.text,
  timestamp: data.timestamp,
  leadId: data.lead_id || undefined,
  readBy: data.read_by || [],
  receiverId: data.receiver_id || undefined,
  fileUrl: data.file_url || undefined,
  fileName: data.file_name || undefined,
})

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true })
      if (data) setMessages(data.map(mapMsg))
    }
    fetchMessages()

    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = mapMsg(payload.new)
          setMessages((prev) => [...prev, newMsg])
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const updatedMsg = mapMsg(payload.new)
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const playNotificationSound = () => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.value = 600
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime)

      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.1)

      setTimeout(() => {
        const osc2 = audioCtx.createOscillator()
        const gain2 = audioCtx.createGain()
        osc2.connect(gain2)
        gain2.connect(audioCtx.destination)
        osc2.type = 'sine'
        osc2.frequency.value = 800
        gain2.gain.setValueAtTime(0.05, audioCtx.currentTime)
        osc2.start()
        osc2.stop(audioCtx.currentTime + 0.15)
      }, 150)
    } catch (e) {}
  }

  const sendMessage = async (
    msg: Omit<ChatMessage, 'id' | 'timestamp' | 'readBy'>,
  ) => {
    const { error } = await supabase.from('chat_messages').insert({
      user_id: msg.userId,
      user_name: msg.userName,
      text: msg.text,
      lead_id: msg.leadId,
      receiver_id: msg.receiverId,
      file_url: msg.fileUrl,
      file_name: msg.fileName,
      read_by: [msg.userId],
    })

    if (!error && (!msg.receiverId || msg.receiverId !== msg.userId)) {
      sendBrowserNotification(`Nova mensagem de ${msg.userName}`, {
        body: msg.fileUrl ? 'Enviou um arquivo' : msg.text,
      })
      if (document.hidden) playNotificationSound()
    }
  }

  const markAllAsRead = async (userId: string, channelId?: string) => {
    const toUpdate = messages.filter((m) => {
      const isUnread = !m.readBy.includes(userId)
      if (!isUnread) return false
      if (channelId) {
        const isGeneral = channelId === 'general' && !m.receiverId
        const isDM =
          channelId !== 'general' &&
          (m.userId === channelId || m.receiverId === channelId)
        return isGeneral || isDM
      }
      return true
    })

    for (const msg of toUpdate) {
      await supabase
        .from('chat_messages')
        .update({
          read_by: [...msg.readBy, userId],
        })
        .eq('id', msg.id)
    }
  }

  const getUnreadCount = (userId: string, channelId?: string) => {
    return messages.filter((m) => {
      const isUnread = !m.readBy.includes(userId)
      if (!isUnread) return false

      if (channelId) {
        if (channelId === 'general') return !m.receiverId
        return m.userId === channelId || m.receiverId === channelId
      }

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
