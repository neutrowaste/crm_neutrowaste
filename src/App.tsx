import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Index from '@/pages/Index'
import Leads from '@/pages/Leads'
import NewLead from '@/pages/NewLead'
import EditLead from '@/pages/EditLead'
import CalendarPage from '@/pages/Calendar'
import LogsPage from '@/pages/Logs'
import TemplatesPage from '@/pages/Templates'
import PlaceholderPage from '@/pages/PlaceholderPage'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ChatPage from '@/pages/Chat'
import { LeadsProvider } from '@/contexts/LeadsContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { LogsProvider } from '@/contexts/LogsContext'
import { TasksProvider } from '@/contexts/TasksContext'
import { TemplatesProvider } from '@/contexts/TemplatesContext'
import { WhatsAppProvider } from '@/contexts/WhatsAppContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <WhatsAppProvider>
            <LogsProvider>
              <TasksProvider>
                <TemplatesProvider>
                  <LeadsProvider>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Layout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<Index />} />
                        <Route path="leads" element={<Leads />} />
                        <Route path="leads/new" element={<NewLead />} />
                        <Route path="leads/edit/:id" element={<EditLead />} />
                        <Route path="calendar" element={<CalendarPage />} />
                        <Route path="chat" element={<ChatPage />} />
                        <Route path="logs" element={<LogsPage />} />
                        <Route path="templates" element={<TemplatesPage />} />
                        <Route
                          path="reports"
                          element={<PlaceholderPage title="Relatórios" />}
                        />
                        <Route
                          path="financial-reports"
                          element={
                            <PlaceholderPage title="Relatórios Financeiros" />
                          }
                        />
                        <Route
                          path="settings"
                          element={<PlaceholderPage title="Configurações" />}
                        />
                      </Route>
                    </Routes>
                  </LeadsProvider>
                </TemplatesProvider>
              </TasksProvider>
            </LogsProvider>
          </WhatsAppProvider>
        </ChatProvider>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
