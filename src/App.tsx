import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Index from '@/pages/Index'
import Leads from '@/pages/Leads'
import NewLead from '@/pages/NewLead'
import PlaceholderPage from '@/pages/PlaceholderPage'
import { LeadsProvider } from '@/contexts/LeadsContext'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <LeadsProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
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
      <Toaster />
    </BrowserRouter>
  )
}

export default App
