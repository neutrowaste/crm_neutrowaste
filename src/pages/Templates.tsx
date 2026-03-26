import { useState } from 'react'
import { useTemplates, EmailTemplate } from '@/contexts/TemplatesContext'
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
import { Plus, Edit, Trash } from 'lucide-react'

export default function Templates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } =
    useTemplates()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const openDialog = (tpl?: EmailTemplate) => {
    if (tpl) {
      setEditingId(tpl.id)
      setName(tpl.name)
      setSubject(tpl.subject)
      setBody(tpl.body)
    } else {
      setEditingId(null)
      setName('')
      setSubject('')
      setBody('')
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingId) {
      updateTemplate(editingId, { name, subject, body })
    } else {
      addTemplate({ name, subject, body })
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Modelos de E-mail
          </h1>
          <p className="text-muted-foreground">
            Crie templates para enviar e-mails padronizados rapidamente.
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Modelo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Modelos</CardTitle>
          <CardDescription>
            Variáveis disponíveis:{' '}
            {'{{company_name}}, {{contact_name}}, {{lead_value}}'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Modelo</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Nenhum modelo criado.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell className="font-medium">{tpl.name}</TableCell>
                    <TableCell>{tpl.subject}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(tpl)}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTemplate(tpl.id)}
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Modelo' : 'Novo Modelo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Modelo</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Proposta Inicial"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assunto</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Apresentação para {{company_name}}"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Corpo da Mensagem</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Olá {{contact_name}}..."
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!name || !subject || !body}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
