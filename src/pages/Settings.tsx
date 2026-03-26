import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/components/ThemeProvider'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Building2,
  Palette,
  Shield,
  Loader2,
  Monitor,
  Moon,
  Sun,
  LogOut,
  Users,
} from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Profile Tab State
  const [name, setName] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Company Tab State
  const [companyName, setCompanyName] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [settingsId, setSettingsId] = useState('')
  const [isSavingCompany, setIsSavingCompany] = useState(false)
  const [isLoadingCompany, setIsLoadingCompany] = useState(true)

  // Security Tab State
  const [isSendingReset, setIsSendingReset] = useState(false)

  // Users Tab State
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
    }
  }, [user])

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      if (data) setUsers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'Admin') {
      const loadSettings = async () => {
        setIsLoadingCompany(true)
        try {
          const { data } = await (supabase as any)
            .from('app_settings')
            .select('*')
            .limit(1)
            .single()

          if (data) {
            setCompanyName(data.company_name)
            setSupportEmail(data.support_email)
            setSettingsId(data.id)
          }
        } catch (e) {
          console.error('Erro ao carregar configurações globais:', e)
        } finally {
          setIsLoadingCompany(false)
        }
      }
      loadSettings()
      loadUsers()
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    setIsSavingProfile(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id)

      if (error) throw error
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: err.message,
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveCompany = async () => {
    if (!settingsId) return
    setIsSavingCompany(true)
    try {
      const { error } = await (supabase as any)
        .from('app_settings')
        .update({
          company_name: companyName,
          support_email: supportEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settingsId)

      if (error) throw error
      toast({
        title: 'Configurações salvas',
        description: 'Informações da organização atualizadas com sucesso.',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: err.message,
      })
    } finally {
      setIsSavingCompany(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user) return
    setIsSendingReset(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      })
    } catch (err: any) {
      const msg = err.message?.toLowerCase() || ''
      if (
        msg.includes('smtp') ||
        msg.includes('sender') ||
        msg.includes('v.from')
      ) {
        toast({
          variant: 'destructive',
          title: 'Erro de SMTP no Supabase',
          description:
            'Não foi possível enviar o e-mail devido a um erro de configuração do provedor SMTP. Verifique no painel do Supabase.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao enviar',
          description: err.message,
        })
      }
    } finally {
      setIsSendingReset(false)
    }
  }

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)
      if (error) throw error
      toast({ title: 'Status do usuário atualizado com sucesso' })
      loadUsers()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: error.message,
      })
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      if (error) throw error
      toast({ title: 'Perfil do usuário atualizado com sucesso' })
      loadUsers()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: error.message,
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Configurações Gerais
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências, perfil e configurações do sistema.
        </p>
      </div>

      <Tabs
        defaultValue="profile"
        className="flex flex-col md:flex-row gap-8 mt-4"
      >
        <TabsList className="flex flex-col h-auto w-full md:w-64 shrink-0 bg-transparent space-y-2 p-0 justify-start md:border-r md:pr-6 border-border">
          <TabsTrigger
            value="profile"
            className="w-full justify-start px-4 py-2.5 h-11 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-colors rounded-md"
          >
            <User className="w-4 h-4 mr-3" /> Meu Perfil
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="w-full justify-start px-4 py-2.5 h-11 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-colors rounded-md"
          >
            <Palette className="w-4 h-4 mr-3" /> Aparência
          </TabsTrigger>
          {user?.role === 'Admin' && (
            <>
              <TabsTrigger
                value="users"
                className="w-full justify-start px-4 py-2.5 h-11 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-colors rounded-md"
              >
                <Users className="w-4 h-4 mr-3" /> Gestão de Usuários
              </TabsTrigger>
              <TabsTrigger
                value="company"
                className="w-full justify-start px-4 py-2.5 h-11 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-colors rounded-md"
              >
                <Building2 className="w-4 h-4 mr-3" /> Dados da Empresa
              </TabsTrigger>
            </>
          )}
          <TabsTrigger
            value="security"
            className="w-full justify-start px-4 py-2.5 h-11 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-colors rounded-md"
          >
            <Shield className="w-4 h-4 mr-3" /> Acesso e Segurança
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full min-w-0">
          <TabsContent value="profile" className="mt-0 outline-none">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais de acesso.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSaveProfile()
                  }}
                  className="space-y-4 max-w-md"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" value={user?.email || ''} disabled />
                    <p className="text-xs text-muted-foreground">
                      O e-mail é sua chave única e não pode ser alterado por
                      aqui.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Perfil de Acesso</Label>
                    <Input
                      value={
                        user?.role === 'Admin' ? 'Administrador' : 'Vendedor'
                      }
                      disabled
                      className="bg-muted/50 font-medium"
                    />
                  </div>
                  <div className="pt-2">
                    <Button type="submit" disabled={isSavingProfile}>
                      {isSavingProfile && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0 outline-none">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize o tema do sistema de acordo com a sua preferência.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className={`flex flex-col h-28 items-center justify-center gap-3 transition-all ${theme === 'light' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-7 w-7" />
                    <span className="font-medium">Modo Claro</span>
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className={`flex flex-col h-28 items-center justify-center gap-3 transition-all ${theme === 'dark' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-7 w-7" />
                    <span className="font-medium">Modo Escuro</span>
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className={`flex flex-col h-28 items-center justify-center gap-3 transition-all ${theme === 'system' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-7 w-7" />
                    <span className="font-medium">Padrão do Sistema</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.role === 'Admin' && (
            <TabsContent value="users" className="mt-0 outline-none">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Gestão de Usuários</CardTitle>
                  <CardDescription>
                    Aprove solicitações de acesso e gerencie as permissões da
                    equipe.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="border rounded-md bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Perfil</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell className="font-medium">
                                {u.name}
                              </TableCell>
                              <TableCell>{u.email}</TableCell>
                              <TableCell>
                                <Select
                                  value={u.role}
                                  onValueChange={(val) =>
                                    handleUpdateUserRole(u.id, val)
                                  }
                                  disabled={u.id === user.id}
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Admin">
                                      Administrador
                                    </SelectItem>
                                    <SelectItem value="Seller">
                                      Vendedor
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    u.status === 'active'
                                      ? 'success'
                                      : u.status === 'pending'
                                        ? 'warning'
                                        : 'destructive'
                                  }
                                >
                                  {u.status === 'active'
                                    ? 'Ativo'
                                    : u.status === 'pending'
                                      ? 'Pendente'
                                      : 'Rejeitado'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Select
                                  value={u.status}
                                  onValueChange={(val) =>
                                    handleUpdateUserStatus(u.id, val)
                                  }
                                  disabled={u.id === user.id}
                                >
                                  <SelectTrigger className="w-36 h-8 text-xs ml-auto">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">
                                      Aprovar Acesso
                                    </SelectItem>
                                    <SelectItem value="pending">
                                      Pendente
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                      Bloquear Acesso
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                          {users.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-6 text-muted-foreground"
                              >
                                Nenhum usuário encontrado.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {user?.role === 'Admin' && (
            <TabsContent value="company" className="mt-0 outline-none">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>
                    Configure as informações globais que aparecerão no sistema e
                    em portais externos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  {isLoadingCompany ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSaveCompany()
                      }}
                      className="space-y-5 max-w-md"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="companyName">
                          Razão Social / Nome Fantasia
                        </Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Nome da sua organização"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supportEmail">
                          E-mail Central (Suporte/Contato)
                        </Label>
                        <Input
                          id="supportEmail"
                          type="email"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          placeholder="contato@empresa.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          Utilizado como referência em rodapés e e-mails
                          automáticos.
                        </p>
                      </div>
                      <div className="pt-2">
                        <Button type="submit" disabled={isSavingCompany}>
                          {isSavingCompany && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Salvar Configurações
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="security" className="mt-0 outline-none">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Acesso e Segurança</CardTitle>
                <CardDescription>
                  Proteja sua conta e gerencie suas credenciais.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div className="max-w-2xl border rounded-lg p-5 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">
                      Redefinir Senha
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enviaremos um link seguro para o seu e-mail para que você
                      possa escolher uma nova senha de acesso.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="shrink-0 w-full sm:w-auto"
                    onClick={handlePasswordReset}
                    disabled={isSendingReset}
                  >
                    {isSendingReset ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="mr-2 h-4 w-4" />
                    )}
                    Solicitar Redefinição
                  </Button>
                </div>

                <div className="max-w-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-red-600 dark:text-red-400">
                      Encerrar Sessão
                    </Label>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80">
                      Sair da sua conta neste dispositivo.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="shrink-0 w-full sm:w-auto"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Deslogar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
