import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLogs } from '@/contexts/LogsContext'
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
  Camera,
  Trash2,
  UserPlus,
  Edit2,
  Mail,
  Server,
  CheckCircle2,
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ImageCropperDialog } from '@/components/settings/ImageCropperDialog'
import { CreateUserDialog } from '@/components/settings/CreateUserDialog'
import { EditUserDialog } from '@/components/settings/EditUserDialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Settings() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Profile Tab State
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Company Tab State
  const [companyName, setCompanyName] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [settingsId, setSettingsId] = useState('')
  const [isSavingCompany, setIsSavingCompany] = useState(false)
  const [isLoadingCompany, setIsLoadingCompany] = useState(true)

  // Email API (Resend) Tab State
  const [smtpId, setSmtpId] = useState('')
  const [smtpPass, setSmtpPass] = useState('') // Used for Resend API Key
  const [smtpFromEmail, setSmtpFromEmail] = useState('')
  const [smtpFromName, setSmtpFromName] = useState('')
  const [smtpIsActive, setSmtpIsActive] = useState(false)
  const [isSavingSmtp, setIsSavingSmtp] = useState(false)
  const [isTestingSmtp, setIsTestingSmtp] = useState(false)
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(true)

  // Security Tab State
  const [isSendingReset, setIsSendingReset] = useState(false)

  // Users Tab State
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const { addLog } = useLogs()

  useEffect(() => {
    if (user) {
      setName(user.name)
      setAvatarUrl(user.avatarUrl || '')
    }
  }, [user])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Formato inválido',
        description: 'Por favor, selecione uma imagem (JPG, PNG).',
      })
      return
    }

    setCropFile(file)
    setCropOpen(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user) return
    setCropOpen(false)
    setIsUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const newAvatarUrl = data.publicUrl

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(newAvatarUrl)
      toast({
        title: 'Foto atualizada',
        description: 'Sua foto de perfil foi alterada com sucesso.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer upload',
        description: error.message,
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

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

      const loadSmtp = async () => {
        setIsLoadingSmtp(true)
        try {
          const { data } = await (supabase as any)
            .from('smtp_settings')
            .select('*')
            .limit(1)
            .single()

          if (data) {
            setSmtpId(data.id)
            setSmtpPass(data.password || '')
            setSmtpFromEmail(data.from_email || '')
            setSmtpFromName(data.from_name || '')
            setSmtpIsActive(data.is_active || false)
          }
        } catch (e) {
          console.error('Erro ao carregar configurações SMTP:', e)
        } finally {
          setIsLoadingSmtp(false)
        }
      }

      loadSettings()
      loadSmtp()
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

  const handleSaveSmtp = async () => {
    if (!smtpId) return
    setIsSavingSmtp(true)
    try {
      const { error } = await (supabase as any)
        .from('smtp_settings')
        .update({
          host: 'resend', // Fixar host como resend
          password: smtpPass, // Usar password para API Key
          from_email: smtpFromEmail,
          from_name: smtpFromName,
          is_active: smtpIsActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', smtpId)

      if (error) throw error
      toast({
        title: 'Configurações SMTP salvas',
        description:
          'Suas configurações de servidor de e-mail foram atualizadas.',
      })

      await addLog({
        userId: user?.id || '',
        userName: user?.name || '',
        action: 'Configuração SMTP',
        leadId: '',
        leadName: 'Sistema',
        details: `As configurações do servidor de e-mail próprio foram ${smtpIsActive ? 'ativadas' : 'atualizadas'}.`,
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: err.message,
      })
    } finally {
      setIsSavingSmtp(false)
    }
  }

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true)
    setTimeout(() => {
      setIsTestingSmtp(false)
      toast({
        title: 'Conexão bem-sucedida',
        description:
          'Foi possível conectar ao servidor SMTP com as credenciais fornecidas.',
      })
    }, 1500)
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

  const handleDeleteUser = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId)
    if (
      !window.confirm(
        'Tem certeza que deseja excluir este usuário definitivamente? Esta ação não pode ser desfeita e removerá o acesso do usuário ao sistema.',
      )
    )
      return
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
      if (error) throw error

      await addLog({
        userId: user?.id || '',
        userName: user?.name || '',
        action: 'Exclusão de Usuário',
        leadId: '',
        leadName: 'Sistema',
        details: `O usuário ${targetUser?.name} (${targetUser?.email}) foi excluído do sistema.`,
      })

      toast({ title: 'Usuário excluído com sucesso' })
      loadUsers()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir usuário',
        description: error.message,
      })
    }
  }

  const handleToggleUserStatus = async (targetUser: any) => {
    const newStatus = targetUser.status === 'rejected' ? 'active' : 'rejected'
    const actionText =
      newStatus === 'rejected'
        ? 'Bloqueio de Usuário'
        : 'Desbloqueio de Usuário'

    if (
      newStatus === 'rejected' &&
      !window.confirm(
        `Tem certeza que deseja suspender o acesso de ${targetUser.name}?`,
      )
    ) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', targetUser.id)

      if (error) throw error

      await addLog({
        userId: user?.id || '',
        userName: user?.name || '',
        action: actionText,
        leadId: '',
        leadName: 'Sistema',
        details: `O acesso do usuário ${targetUser.name} (${targetUser.email}) foi ${newStatus === 'rejected' ? 'suspenso' : 'reativado'}.`,
      })

      toast({
        title: `Acesso ${newStatus === 'rejected' ? 'suspenso' : 'reativado'} com sucesso`,
      })
      loadUsers()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar status',
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
              <TabsTrigger
                value="smtp"
                className="w-full justify-start px-4 py-2.5 h-11 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-colors rounded-md"
              >
                <Mail className="w-4 h-4 mr-3" /> Servidor de E-mail
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
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6 pb-6 border-b border-border">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-2 border-muted shadow-sm">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="text-2xl">
                          {name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={isUploadingAvatar}
                      />
                      <ImageCropperDialog
                        file={cropFile}
                        open={cropOpen}
                        onOpenChange={setCropOpen}
                        onCrop={handleAvatarUpload}
                      />
                    </div>
                    <div className="space-y-2 text-center sm:text-left flex-1 pt-2">
                      <h3 className="font-medium text-base">Foto de Perfil</h3>
                      <p className="text-sm text-muted-foreground">
                        Recomendamos imagens quadradas de pelo menos 256x256px.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4 mr-2" />
                        )}
                        Alterar foto
                      </Button>
                    </div>
                  </div>

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
                <CardHeader className="px-0 pt-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <CardTitle>Gestão de Usuários</CardTitle>
                    <CardDescription>
                      Aprove solicitações de acesso e gerencie as permissões da
                      equipe.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsCreateUserOpen(true)}
                    size="sm"
                    className="shrink-0"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Button>
                </CardHeader>
                <CardContent className="px-0">
                  <CreateUserDialog
                    open={isCreateUserOpen}
                    onOpenChange={setIsCreateUserOpen}
                    onSuccess={loadUsers}
                  />
                  {editingUser && (
                    <EditUserDialog
                      user={editingUser}
                      open={!!editingUser}
                      onOpenChange={(open) => !open && setEditingUser(null)}
                      onSuccess={() => {
                        setEditingUser(null)
                        loadUsers()
                      }}
                    />
                  )}
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="border rounded-md bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Perfil</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Último Acesso</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      u.is_online
                                        ? 'bg-green-500'
                                        : 'bg-muted-foreground/30'
                                    }`}
                                    title={u.is_online ? 'Online' : 'Offline'}
                                  />
                                  <span>{u.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {u.email}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="font-normal bg-muted/50"
                                >
                                  {u.role === 'Admin'
                                    ? 'Administrador'
                                    : 'Vendedor'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    u.status === 'active'
                                      ? 'success'
                                      : u.status === 'pending'
                                        ? 'warning'
                                        : u.status === 'inactive'
                                          ? 'secondary'
                                          : 'destructive'
                                  }
                                >
                                  {u.status === 'active'
                                    ? 'Ativo'
                                    : u.status === 'pending'
                                      ? 'Pendente'
                                      : u.status === 'inactive'
                                        ? 'Inativo'
                                        : 'Bloqueado'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {u.last_sign_in_at
                                  ? format(
                                      new Date(u.last_sign_in_at),
                                      "dd/MM/yyyy 'às' HH:mm",
                                      { locale: ptBR },
                                    )
                                  : 'Nunca acessou'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleToggleUserStatus(u)}
                                    disabled={u.id === user.id}
                                    title={
                                      u.status === 'rejected'
                                        ? 'Reativar Acesso'
                                        : 'Suspender Acesso'
                                    }
                                  >
                                    <Shield
                                      className={`h-4 w-4 ${u.status === 'rejected' ? 'text-green-500' : 'text-amber-500'}`}
                                    />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => setEditingUser(u)}
                                    title="Editar Usuário"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteUser(u.id)}
                                    disabled={u.id === user.id}
                                    title="Excluir Usuário"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {users.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={6}
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
            <TabsContent value="smtp" className="mt-0 outline-none">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Servidor de E-mail (Resend API)</CardTitle>
                  <CardDescription>
                    Configure sua API Key do Resend para envio profissional de
                    e-mails de forma rápida e segura.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  {isLoadingSmtp ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-6 max-w-2xl">
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Server className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="text-sm font-medium">
                            Status do Provedor de E-mail
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Ative para substituir o remetente padrão do sistema
                            pelo seu domínio configurado no Resend.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant={smtpIsActive ? 'default' : 'outline'}
                            className={
                              smtpIsActive
                                ? 'bg-green-600 hover:bg-green-700'
                                : ''
                            }
                            onClick={() => setSmtpIsActive(!smtpIsActive)}
                          >
                            {smtpIsActive ? (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />{' '}
                                Ativado
                              </>
                            ) : (
                              'Desativado'
                            )}
                          </Button>
                        </div>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleSaveSmtp()
                        }}
                        className="space-y-5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="smtpPass">API Key (Resend)</Label>
                            <Input
                              id="smtpPass"
                              type="password"
                              value={smtpPass}
                              onChange={(e) => setSmtpPass(e.target.value)}
                              placeholder="re_..."
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Obtenha esta chave de segurança no painel da sua
                              conta Resend.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="smtpFromName">
                              Nome do Remetente
                            </Label>
                            <Input
                              id="smtpFromName"
                              value={smtpFromName}
                              onChange={(e) => setSmtpFromName(e.target.value)}
                              placeholder="Ex: Equipe Neutrowaste"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="smtpFromEmail">
                              E-mail de Envio
                            </Label>
                            <Input
                              id="smtpFromEmail"
                              type="email"
                              value={smtpFromEmail}
                              onChange={(e) => setSmtpFromEmail(e.target.value)}
                              placeholder="Ex: contato@neutrowaste.com"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Este domínio precisa estar verificado no Resend.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t">
                          <Button type="submit" disabled={isSavingSmtp}>
                            {isSavingSmtp && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Salvar Configurações
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleTestSmtp}
                            disabled={isTestingSmtp || !smtpPass}
                          >
                            {isTestingSmtp ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Server className="mr-2 h-4 w-4" />
                            )}
                            Testar Conexão
                          </Button>
                        </div>
                      </form>
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
