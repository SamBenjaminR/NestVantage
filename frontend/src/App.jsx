
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import SiteVisits from './pages/SiteVisits'
import Conversations from './pages/Conversations'
import Analytics from './pages/Analytics'
import PropertyFactSheets from './pages/PropertyFactSheets'
import Handoffs from './pages/Handoffs'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/visits" element={<SiteVisits />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/handoffs" element={<Handoffs />} />
          <Route path="/properties" element={<PropertyFactSheets />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
