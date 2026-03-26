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
import { Send, Hash } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'

export default function ChatPage() {
  const { messages, sendMessage, markAllAsRead } = useChat()
  const { user } = useAuth()
  const { leads } = useLeads()

  const [text, setText] = useState('')
  const [selectedLeadId, setSelectedLeadId] = useState<string>('none')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) markAllAsRead(user.id)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, user])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !user) return

    sendMessage({
      userId: user.id,
      userName: user.name,
      text: text.trim(),
      leadId: selectedLeadId === 'none' ? undefined : selectedLeadId,
    })

    setText('')
    setSelectedLeadId('none')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Chat da Equipe
        </h1>
        <p className="text-muted-foreground">
          Comunicação interna e discussão de oportunidades.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b py-3 px-6 bg-muted/20 shrink-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Canal
            Geral
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma mensagem ainda. Inicie a conversa!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.userId === user?.id
              const mentionedLead = msg.leadId
                ? leads.find((l) => l.id === msg.leadId)
                : null

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
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
                      className={`px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white border rounded-tl-none'}`}
                    >
                      {msg.text}
                      {mentionedLead && (
                        <div
                          className={`mt-2 p-2 rounded text-xs flex items-center gap-1 ${isMe ? 'bg-primary-foreground/10' : 'bg-muted'}`}
                        >
                          <Hash className="w-3 h-3" />
                          <Link
                            to={`/leads/edit/${mentionedLead.id}`}
                            className="hover:underline font-medium"
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

        <div className="p-4 border-t bg-white shrink-0">
          <form onSubmit={handleSend} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-[200px] shrink-0">
                <Select
                  value={selectedLeadId}
                  onValueChange={setSelectedLeadId}
                >
                  <SelectTrigger className="h-10 border-dashed bg-muted/50">
                    <SelectValue placeholder="Mencionar Lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem menção</SelectItem>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Digite sua mensagem..."
                className="flex-1 h-10"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
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
  )
}
