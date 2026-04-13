import { useState, useRef, useEffect, useMemo } from 'react'
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
import {
  Send,
  Hash,
  ArrowLeft,
  User as UserIcon,
  Paperclip,
  FileText,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// Helper for deterministic seed
const getAvatarSeed = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 1000
}

export default function ChatPage() {
  const { messages, sendMessage, markAllAsRead, getUnreadCount } = useChat()
  const { user, allUsers } = useAuth()
  const { leads } = useLeads()
  const { toast } = useToast()

  const [text, setText] = useState('')
  const [selectedLeadId, setSelectedLeadId] = useState<string>('none')
  const [activeChannel, setActiveChannel] = useState<string>('general')
  const [showMobileList, setShowMobileList] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const safeAllUsers = useMemo(() => allUsers || [], [allUsers])

  useEffect(() => {
    if (user && !showMobileList) {
      markAllAsRead(user.id, activeChannel)
    }
    const timeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    return () => clearTimeout(timeout)
  }, [messages.length, user, activeChannel, showMobileList, markAllAsRead])

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!text.trim() && !selectedLeadId) return

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      toast({
        variant: 'destructive',
        title: 'Formato inválido',
        description:
          'Apenas arquivos PDF ou documentos são permitidos no chat.',
      })
      return
    }

    sendMessage({
      userId: user.id,
      userName: user.name,
      text: 'Enviou um documento anexado.',
      leadId: selectedLeadId === 'none' ? undefined : selectedLeadId,
      receiverId: activeChannel === 'general' ? undefined : activeChannel,
      fileUrl: '#',
      fileName: file.name,
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
    setSelectedLeadId('none')
  }

  const handleChannelClick = (channelId: string) => {
    setActiveChannel(channelId)
    setShowMobileList(false)
  }

  const filteredMessages = messages.filter((msg) => {
    if (activeChannel === 'general') return !msg.receiverId
    return (
      (msg.userId === user.id && msg.receiverId === activeChannel) ||
      (msg.userId === activeChannel && msg.receiverId === user.id)
    )
  })

  const activeChannelName =
    activeChannel === 'general'
      ? 'Canal Geral'
      : safeAllUsers.find((u) => u.id === activeChannel)?.name || 'Usuário'

  const activeUserStatus =
    activeChannel !== 'general'
      ? safeAllUsers.find((u) => u.id === activeChannel)?.isOnline
      : undefined

  const otherUsers = safeAllUsers.filter((u) => u.id !== user.id)

  const getAvatar = (
    userId: string | undefined | null,
    fallbackName: string,
  ) => {
    if (!userId)
      return `https://img.usecurling.com/ppl/thumbnail?seed=${getAvatarSeed(fallbackName)}`
    const foundUser = safeAllUsers.find((u) => u.id === userId)
    if (foundUser?.avatarUrl) return foundUser.avatarUrl
    return `https://img.usecurling.com/ppl/thumbnail?seed=${getAvatarSeed(userId)}`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)]">
      <div className="mb-4 shrink-0 hidden md:block">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Chat da Equipe
        </h1>
        <p className="text-muted-foreground mt-1">
          Comunicação interna e discussão de oportunidades.
        </p>
      </div>

      <div className="flex h-full gap-4 overflow-hidden relative">
        <Card
          className={cn(
            'w-full md:w-80 flex flex-col shrink-0 overflow-hidden absolute md:relative z-10 h-full md:h-auto inset-0 transition-transform duration-300 ease-in-out bg-background',
            !showMobileList
              ? '-translate-x-full md:translate-x-0'
              : 'translate-x-0',
          )}
        >
          <CardHeader className="border-b py-4 px-4 bg-muted/30 shrink-0">
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
                  : 'hover:bg-muted text-foreground',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <Hash className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Canal Geral</span>
                  <span className="text-xs text-muted-foreground">
                    Todos da equipe
                  </span>
                </div>
              </div>
              {getUnreadCount(user.id, 'general') > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-medium">
                  {getUnreadCount(user.id, 'general')}
                </span>
              )}
            </button>

            <div className="pt-4 pb-2 px-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Mensagens Diretas
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {otherUsers.filter((u) => u.isOnline).length} Online
              </span>
            </div>

            {otherUsers.map((u) => {
              const unread = getUnreadCount(user.id, u.id)
              return (
                <button
                  key={u.id}
                  onClick={() => handleChannelClick(u.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                    activeChannel === u.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-foreground',
                  )}
                >
                  <div className="flex items-center gap-3 relative">
                    <div className="relative">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={getAvatar(u.id, u.name)} />
                        <AvatarFallback>
                          {u.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                          u.isOnline ? 'bg-green-500' : 'bg-gray-400',
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{u.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {u.role}
                      </span>
                    </div>
                  </div>
                  {unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-medium">
                      {unread}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        <Card
          className={cn(
            'flex-1 flex flex-col overflow-hidden w-full absolute md:relative z-0 h-full md:h-auto inset-0 transition-transform duration-300 ease-in-out bg-background',
            showMobileList
              ? 'translate-x-full md:translate-x-0'
              : 'translate-x-0',
          )}
        >
          <CardHeader className="border-b py-3 px-4 bg-background shrink-0 flex flex-row items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-3 w-full">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0 -ml-2"
                onClick={() => setShowMobileList(true)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {activeChannel === 'general' ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <Hash className="h-4 w-4" />
                </div>
              ) : (
                <div className="relative">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={getAvatar(activeChannel, activeChannelName)}
                    />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  {activeUserStatus !== undefined && (
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
                        activeUserStatus ? 'bg-green-500' : 'bg-gray-400',
                      )}
                    />
                  )}
                </div>
              )}
              <div className="flex flex-col truncate">
                <CardTitle className="text-sm font-medium leading-none truncate">
                  {activeChannelName}
                </CardTitle>
                {activeChannel !== 'general' && (
                  <span className="text-xs text-muted-foreground mt-1 leading-none">
                    {activeUserStatus ? 'Online' : 'Offline'}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-muted/10">
            {filteredMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Nenhuma mensagem nesta conversa. Inicie a comunicação!
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.userId === user.id
                const mentionedLead = msg.leadId
                  ? leads.find((l) => l.id === msg.leadId)
                  : null

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[90%] md:max-w-[75%] animate-in fade-in slide-in-from-bottom-2 ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0 shadow-sm hidden sm:flex">
                      <AvatarImage src={getAvatar(msg.userId, msg.userName)} />
                      <AvatarFallback>
                        {msg.userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex flex-col gap-1 w-full ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-1">
                        <span>{msg.userName}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(msg.timestamp), 'HH:mm', {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border rounded-tl-none'}`}
                        style={{ wordBreak: 'break-word' }}
                      >
                        {msg.text}

                        {msg.fileName && (
                          <div
                            className={`mt-2 p-2.5 rounded-md text-xs flex items-center gap-2 border ${isMe ? 'bg-primary-foreground/10 border-primary-foreground/20' : 'bg-muted border-border'}`}
                          >
                            <FileText className="w-4 h-4 shrink-0 opacity-80" />
                            <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                              {msg.fileName}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-6 px-2 ml-auto shrink-0 ${isMe ? 'text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground' : ''}`}
                            >
                              Abrir
                            </Button>
                          </div>
                        )}

                        {mentionedLead && (
                          <div
                            className={`mt-2 p-2 rounded text-xs flex items-center gap-1.5 ${isMe ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-muted text-foreground'}`}
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

          <div className="p-3 md:p-4 border-t bg-background shrink-0 rounded-b-lg">
            <form onSubmit={handleSend} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-[120px] md:w-[180px] shrink-0 hidden sm:block">
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

                <div className="relative shrink-0">
                  <input
                    type="file"
                    id="chat-file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-muted-foreground"
                    onClick={() => fileInputRef.current?.click()}
                    title="Anexar Documento"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>

                <Input
                  placeholder="Mensagem..."
                  className="flex-1 h-10 text-sm"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
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
              <div className="sm:hidden w-full">
                <Select
                  value={selectedLeadId}
                  onValueChange={setSelectedLeadId}
                >
                  <SelectTrigger className="h-8 border-dashed bg-muted/50 text-xs w-full">
                    <SelectValue placeholder="Mencionar Lead (Opcional)" />
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
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
