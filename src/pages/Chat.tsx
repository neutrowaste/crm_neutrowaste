import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLeads } from '@/contexts/LeadsContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send, Hash, ArrowLeft, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const { messages, sendMessage, markAllAsRead, getUnreadCount } = useChat()
  const { user, allUsers } = useAuth()
  const { leads } = useLeads()

  const [text, setText] = useState('')
  const [selectedLeadId, setSelectedLeadId] = useState<string>('none')
  const [activeChannel, setActiveChannel] = useState<string>('general')
  const [showMobileList, setShowMobileList] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && !showMobileList) {
      markAllAsRead(user.id, activeChannel)
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, user, activeChannel, showMobileList, markAllAsRead])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !user) return

    sendMessage({
      userId: user.id,
      userName: user.name,
      text: text.trim(),
      leadId: selectedLeadId === 'none' ? undefined : selectedLeadId,
      receiverId: activeChannel === 'general' ? undefined : activeChannel,
    })

    setText('')
    setSelectedLeadId('none')
  }

  const handleChannelClick = (channelId: string) => {
    setActiveChannel(channelId)
    setShowMobileList(false)
  }

  const filteredMessages = messages.filter((msg) => {
    if (activeChannel === 'general') return !msg.receiverId
    return (
      (msg.userId === user?.id && msg.receiverId === activeChannel) ||
      (msg.userId === activeChannel && msg.receiverId === user?.id)
    )
  })

  const activeChannelName =
    activeChannel === 'general'
      ? 'Canal Geral'
      : allUsers.find((u) => u.id === activeChannel)?.name || 'Usuário'

  const otherUsers = allUsers.filter((u) => u.id !== user?.id)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Chat da Equipe
        </h1>
        <p className="text-muted-foreground">
          Comunicação interna e discussão de oportunidades.
        </p>
      </div>

      <div className="flex h-full gap-4 overflow-hidden">
        {/* Sidebar List */}
        <Card
          className={cn(
            'w-full md:w-80 flex flex-col shrink-0 overflow-hidden',
            !showMobileList && 'hidden md:flex',
          )}
        >
          <CardHeader className="border-b py-4 px-4 bg-muted/10 shrink-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Conversas
            </CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button
              onClick={() => handleChannelClick('general')}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                activeChannel === 'general'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-gray-700',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Hash className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Canal Geral</span>
                  <span className="text-xs text-muted-foreground">
                    Todos da equipe
                  </span>
                </div>
              </div>
              {user && getUnreadCount(user.id, 'general') > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {getUnreadCount(user.id, 'general')}
                </span>
              )}
            </button>

            <div className="pt-4 pb-2 px-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Mensagens Diretas
              </span>
            </div>

            {otherUsers.map((u) => {
              const unread = user ? getUnreadCount(user.id, u.id) : 0
              return (
                <button
                  key={u.id}
                  onClick={() => handleChannelClick(u.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                    activeChannel === u.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-gray-700',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage
                        src={`https://img.usecurling.com/ppl/thumbnail?seed=${u.id}`}
                      />
                      <AvatarFallback>
                        {u.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{u.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {u.role}
                      </span>
                    </div>
                  </div>
                  {unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {unread}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Chat Area */}
        <Card
          className={cn(
            'flex-1 flex flex-col overflow-hidden',
            showMobileList && 'hidden md:flex',
          )}
        >
          <CardHeader className="border-b py-3 px-4 bg-white shrink-0 flex flex-row items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0 -ml-2"
              onClick={() => setShowMobileList(true)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              {activeChannel === 'general' ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Hash className="h-4 w-4" />
                </div>
              ) : (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?seed=${activeChannel}`}
                  />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <CardTitle className="text-sm font-medium">
                {activeChannelName}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/30">
            {filteredMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Nenhuma mensagem nesta conversa. Inicie a comunicação!
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.userId === user?.id
                const mentionedLead = msg.leadId
                  ? leads.find((l) => l.id === msg.leadId)
                  : null

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={`https://img.usecurling.com/ppl/thumbnail?seed=${msg.userId}`}
                      />
                      <AvatarFallback>
                        {msg.userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{msg.userName}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(msg.timestamp), 'HH:mm', {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white border rounded-tl-none'}`}
                      >
                        {msg.text}
                        {mentionedLead && (
                          <div
                            className={`mt-2 p-2 rounded text-xs flex items-center gap-1.5 ${isMe ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-muted text-gray-800'}`}
                          >
                            <Hash className="w-3 h-3 shrink-0" />
                            <Link
                              to={`/leads/edit/${mentionedLead.id}`}
                              className="hover:underline font-medium truncate"
                            >
                              {mentionedLead.name} ({mentionedLead.company})
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </CardContent>

          <div className="p-3 md:p-4 border-t bg-white shrink-0">
            <form onSubmit={handleSend} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-[140px] md:w-[200px] shrink-0">
                  <Select
                    value={selectedLeadId}
                    onValueChange={setSelectedLeadId}
                  >
                    <SelectTrigger className="h-10 border-dashed bg-muted/50 text-xs md:text-sm">
                      <SelectValue placeholder="Mencionar Lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {leads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Mensagem..."
                  className="flex-1 h-10 text-sm"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  autoFocus={!showMobileList}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!text.trim()}
                  className="h-10 w-10 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
