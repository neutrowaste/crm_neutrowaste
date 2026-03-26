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
import { useToast } from '@/hooks/use-toast'

export default function Templates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } =
    useTemplates()
  const { waTemplates, addWaTemplate, updateWaTemplate, deleteWaTemplate } =
    useWhatsApp()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('email')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handleSave = async () => {
    setIsProcessing(true)
    try {
      if (activeTab === 'email') {
        if (editingId) await updateTemplate(editingId, { name, subject, body })
        else await addTemplate({ name, subject, body })
      } else {
        if (editingId) await updateWaTemplate(editingId, { name, text: body })
        else await addWaTemplate({ name, text: body })
      }
      toast({
        title: 'Sucesso',
        description: 'Modelo salvo com sucesso.',
      })
      setIsDialogOpen(false)
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: e.message || 'Erro ao salvar modelo.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Biblioteca de Modelos
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie templates para E-mail (Follow-up) e WhatsApp.
          </p>
        </div>
        <Button onClick={() => openDialog()} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Novo Modelo
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="flex w-max sm:w-full max-w-[400px]">
            <TabsTrigger value="email" className="flex-1">
              <Mail className="w-4 h-4 mr-2 hidden sm:inline-block" /> E-mail
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2 hidden sm:inline-block" />{' '}
              WhatsApp
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="email" className="mt-4">
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
              <div className="rounded-md border overflow-x-auto -mx-6 sm:mx-0">
                <div className="min-w-[600px] px-6 sm:px-0">
                  <Table>
                    <TableHeader className="bg-muted/50">
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
                          <TableRow key={tpl.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {tpl.name}
                            </TableCell>
                            <TableCell>{tpl.subject}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-4">
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
              <div className="rounded-md border overflow-x-auto -mx-6 sm:mx-0">
                <div className="min-w-[600px] px-6 sm:px-0">
                  <Table>
                    <TableHeader className="bg-muted/50">
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
                          <TableRow key={tpl.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium whitespace-nowrap">
                              {tpl.name}
                            </TableCell>
                            <TableCell className="truncate max-w-[200px] md:max-w-md">
                              {tpl.text}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
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
                disabled={isProcessing}
              />
            </div>
            {activeTab === 'email' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Assunto</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Apresentação para {{company_name}}"
                  disabled={isProcessing}
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
                disabled={isProcessing}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={
                !name ||
                !body ||
                (activeTab === 'email' && !subject) ||
                isProcessing
              }
            >
              Salvar Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
