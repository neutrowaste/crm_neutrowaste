import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Index from '@/pages/Index'
import Leads from '@/pages/Leads'
import NewLead from '@/pages/NewLead'
import EditLead from '@/pages/EditLead'
import CalendarPage from '@/pages/Calendar'
import KanbanPage from '@/pages/Kanban'
import LogsPage from '@/pages/Logs'
import TemplatesPage from '@/pages/Templates'
import AutomationsPage from '@/pages/Automations'
import PlaceholderPage from '@/pages/PlaceholderPage'
import SettingsPage from '@/pages/Settings'
import RolesPage from '@/pages/Roles'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import ForceChangePassword from '@/pages/ForceChangePassword'
import ChatPage from '@/pages/Chat'
import ContractsPage from '@/pages/Contracts'
import Portal from '@/pages/Portal'
import Reports from '@/pages/Reports'
import { LeadsProvider } from '@/contexts/LeadsContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { LogsProvider } from '@/contexts/LogsContext'
import { TasksProvider } from '@/contexts/TasksContext'
import { TemplatesProvider } from '@/contexts/TemplatesContext'
import { WhatsAppProvider } from '@/contexts/WhatsAppContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { ContractsProvider } from '@/contexts/ContractsContext'
import { AutomationsProvider } from '@/contexts/AutomationsContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RequirePermission } from '@/components/RequirePermission'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/force-change-password"
              element={<ForceChangePassword />}
            />
            <Route path="/portal/:contractId" element={<Portal />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ChatProvider>
                    <WhatsAppProvider>
                      <LogsProvider>
                        <TasksProvider>
                          <TemplatesProvider>
                            <LeadsProvider>
                              <ContractsProvider>
                                <AutomationsProvider>
                                  <Layout />
                                </AutomationsProvider>
                              </ContractsProvider>
                            </LeadsProvider>
                          </TemplatesProvider>
                        </TasksProvider>
                      </LogsProvider>
                    </WhatsAppProvider>
                  </ChatProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <RequirePermission module="dashboard">
                    <Index />
                  </RequirePermission>
                }
              />
              <Route
                path="leads"
                element={
                  <RequirePermission module="leads">
                    <Leads />
                  </RequirePermission>
                }
              />
              <Route
                path="leads/new"
                element={
                  <RequirePermission module="leads">
                    <NewLead />
                  </RequirePermission>
                }
              />
              <Route
                path="leads/edit/:id"
                element={
                  <RequirePermission module="leads">
                    <EditLead />
                  </RequirePermission>
                }
              />
              <Route
                path="calendar"
                element={
                  <RequirePermission module="calendar">
                    <CalendarPage />
                  </RequirePermission>
                }
              />
              <Route
                path="kanban"
                element={
                  <RequirePermission module="kanban">
                    <KanbanPage />
                  </RequirePermission>
                }
              />
              <Route
                path="chat"
                element={
                  <RequirePermission module="chat">
                    <ChatPage />
                  </RequirePermission>
                }
              />
              <Route
                path="reports"
                element={
                  <RequirePermission module="reports">
                    <Reports />
                  </RequirePermission>
                }
              />
              <Route
                path="logs"
                element={
                  <RequirePermission module="logs">
                    <LogsPage />
                  </RequirePermission>
                }
              />
              <Route
                path="automations"
                element={
                  <RequirePermission module="automations">
                    <AutomationsPage />
                  </RequirePermission>
                }
              />
              <Route
                path="templates"
                element={
                  <RequirePermission module="templates">
                    <TemplatesPage />
                  </RequirePermission>
                }
              />
              <Route
                path="contracts"
                element={
                  <RequirePermission module="contracts">
                    <ContractsPage />
                  </RequirePermission>
                }
              />
              <Route
                path="settings"
                element={
                  <RequirePermission module="settings">
                    <SettingsPage />
                  </RequirePermission>
                }
              />
              <Route
                path="roles"
                element={
                  <RequirePermission module="roles">
                    <RolesPage />
                  </RequirePermission>
                }
              />
              <Route
                path="financial-reports"
                element={
                  <RequirePermission module="reports">
                    <PlaceholderPage title="Relatórios Financeiros" />
                  </RequirePermission>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
