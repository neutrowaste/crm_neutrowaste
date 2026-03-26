import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Index from '@/pages/Index'
import Leads from '@/pages/Leads'
import NewLead from '@/pages/NewLead'
import PlaceholderPage from '@/pages/PlaceholderPage'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import { LeadsProvider } from '@/contexts/LeadsContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
              <Route
                path="calendar"
                element={<PlaceholderPage title="Calendário" />}
              />
              <Route
                path="reports"
                element={<PlaceholderPage title="Relatórios" />}
              />
              <Route
                path="settings"
                element={<PlaceholderPage title="Configurações" />}
              />
            </Route>
          </Routes>
        </LeadsProvider>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
