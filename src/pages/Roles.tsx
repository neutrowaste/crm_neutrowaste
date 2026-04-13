import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface AppRole {
  id: string
  name: string
  permissions: string[]
}

const MODULES = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'leads', name: 'Leads' },
  { id: 'kanban', name: 'Kanban' },
  { id: 'calendar', name: 'Agenda' },
  { id: 'chat', name: 'Chat' },
  { id: 'contracts', name: 'Contratos' },
  { id: 'reports', name: 'Relatórios' },
  { id: 'templates', name: 'Modelos' },
  { id: 'automations', name: 'Gatilhos / Automações' },
  { id: 'logs', name: 'Auditoria' },
  { id: 'settings', name: 'Configurações' },
  { id: 'roles', name: 'Perfis e Acessos' },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<AppRole[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<AppRole | null>(null)
  const [roleName, setRoleName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('app_roles' as any)
        .select('*')
        .order('name')

      if (error) throw error
      setRoles(data || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os perfis.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (role?: AppRole) => {
    if (role) {
      setEditingRole(role)
      setRoleName(role.name)
      setSelectedPermissions(role.permissions || [])
    } else {
      setEditingRole(null)
      setRoleName('')
      setSelectedPermissions([])
    }
    setIsDialogOpen(true)
  }

  const handleTogglePermission = (moduleId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    )
  }

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast({ title: 'Aviso', description: 'O nome do perfil é obrigatório.' })
      return
    }

    try {
      if (editingRole) {
        const { error } = await supabase
          .from('app_roles' as any)
          .update({ name: roleName, permissions: selectedPermissions })
          .eq('id', editingRole.id)

        if (error) throw error
        toast({
          title: 'Sucesso',
          description: 'Perfil atualizado com sucesso.',
        })
      } else {
        const { error } = await supabase
          .from('app_roles' as any)
          .insert({ name: roleName, permissions: selectedPermissions })

        if (error) throw error
        toast({ title: 'Sucesso', description: 'Perfil criado com sucesso.' })
      }
      setIsDialogOpen(false)
      fetchRoles()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar o perfil.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este perfil?')) return

    try {
      const { error } = await supabase
        .from('app_roles' as any)
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Perfil excluído com sucesso.' })
      fetchRoles()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir o perfil.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Perfis e Acessos
          </h1>
          <p className="text-muted-foreground">
            Gerencie os perfis de usuários e defina quais telas eles podem
            acessar.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Perfil
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Carregando perfis...</p>
        ) : (
          roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{role.name}</CardTitle>
                <ShieldAlert className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {role.permissions?.includes('*')
                    ? 'Acesso total a todas as telas'
                    : `${role.permissions?.length || 0} telas permitidas`}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(role)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  {role.name !== 'Admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(role.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Editar Perfil' : 'Novo Perfil'}
            </DialogTitle>
            <DialogDescription>
              Defina o nome do perfil e selecione quais telas este perfil terá
              acesso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Perfil</Label>
              <Input
                id="name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Ex: Gerente de Vendas"
                disabled={editingRole?.name === 'Admin'}
              />
            </div>
            <div className="space-y-4">
              <Label>Telas Permitidas</Label>
              {editingRole?.name === 'Admin' ? (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  O perfil de Administrador possui acesso irrestrito a todas as
                  telas do sistema.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 border p-4 rounded-md h-64 overflow-y-auto">
                  {MODULES.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`module-${module.id}`}
                        checked={selectedPermissions.includes(module.id)}
                        onCheckedChange={() =>
                          handleTogglePermission(module.id)
                        }
                      />
                      <Label
                        htmlFor={`module-${module.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {module.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Perfil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
