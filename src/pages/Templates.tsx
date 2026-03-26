import { useState } from 'react'
import { useTemplates, EmailTemplate } from '@/contexts/TemplatesContext'
import { useWhatsApp, WhatsAppTemplate } from '@/contexts/WhatsAppContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash, Mail, MessageCircle } from 'lucide-react'

export default function Templates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } =
    useTemplates()
  const { waTemplates, addWaTemplate, updateWaTemplate, deleteWaTemplate } =
    useWhatsApp()

  const [activeTab, setActiveTab] = useState('email')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const openDialog = (item?: any) => {
    if (item) {
      setEditingId(item.id)
      setName(item.name)
      setBody(item.text || item.body)
      if (activeTab === 'email') setSubject(item.subject)
    } else {
      setEditingId(null)
      setName('')
      setSubject('')
      setBody('')
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (activeTab === 'email') {
      if (editingId) updateTemplate(editingId, { name, subject, body })
      else addTemplate({ name, subject, body })
    } else {
      if (editingId) updateWaTemplate(editingId, { name, text: body })
      else addWaTemplate({ name, text: body })
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Biblioteca de Modelos
          </h1>
          <p className="text-muted-foreground">
            Crie templates para E-mail (Follow-up) e WhatsApp.
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Modelo
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" /> E-mail (Follow-up)
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de E-mail</CardTitle>
              <CardDescription>
                Variáveis disponíveis:{' '}
                <span className="font-mono text-xs bg-muted px-1 rounded">
                  {'{{company_name}}'}
                </span>
                ,{' '}
                <span className="font-mono text-xs bg-muted px-1 rounded">
                  {'{{contact_name}}'}
                </span>
                ,{' '}
                <span className="font-mono text-xs bg-muted px-1 rounded">
                  {'{{lead_value}}'}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Modelo</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nenhum modelo de e-mail criado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      templates.map((tpl) => (
                        <TableRow key={tpl.id}>
                          <TableCell className="font-medium">
                            {tpl.name}
                          </TableCell>
                          <TableCell>{tpl.subject}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDialog(tpl)}
                              >
                                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTemplate(tpl.id)}
                              >
                                <Trash className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de WhatsApp</CardTitle>
              <CardDescription>
                Variáveis disponíveis:{' '}
                <span className="font-mono text-xs bg-muted px-1 rounded">
                  {'{{company_name}}'}
                </span>
                ,{' '}
                <span className="font-mono text-xs bg-muted px-1 rounded">
                  {'{{lead_name}}'}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Prévia da Mensagem</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waTemplates.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nenhum modelo de WhatsApp criado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      waTemplates.map((tpl) => (
                        <TableRow key={tpl.id}>
                          <TableCell className="font-medium">
                            {tpl.name}
                          </TableCell>
                          <TableCell className="truncate max-w-md">
                            {tpl.text}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDialog(tpl)}
                              >
                                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteWaTemplate(tpl.id)}
                              >
                                <Trash className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Modelo' : 'Novo Modelo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Modelo</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Apresentação Inicial"
              />
            </div>
            {activeTab === 'email' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Assunto</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Apresentação para {{company_name}}"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Corpo da Mensagem</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[150px]"
                placeholder={`Olá {{contact_name}}...`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name || !body || (activeTab === 'email' && !subject)}
            >
              Salvar Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
