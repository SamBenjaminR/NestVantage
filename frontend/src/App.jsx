
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import SiteVisits from './pages/SiteVisits'
import Conversations from './pages/Conversations'
import Analytics from './pages/Analytics'
import PropertyFactSheets from './pages/PropertyFactSheets'
import Handoffs from './pages/Handoffs'
import Login from './pages/Login'
import BookingSlots from './pages/BookingSlots'
import BuyerChat from './pages/BuyerChat'
import MarketingSpends from './pages/MarketingSpends'

import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  const { user } = useAuth()

  const isManager =
    user?.role === 'ADMIN' || user?.role === 'SALES_HEAD'

  return (
    <Routes>
      {/* Public buyer chat: no staff login required */}
      <Route path="/buyer-chat" element={<BuyerChat />} />

      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected staff dashboard */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={['ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE']}
          />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/visits" element={<SiteVisits />} />
          <Route path="/conversations" element={<Conversations />} />

          <Route
            path="/booking-slots"
            element={
              isManager
                ? <BookingSlots />
                : <Navigate to="/" replace />
            }
          />

          <Route
            path="/analytics"
            element={
              isManager
                ? <Analytics />
                : <Navigate to="/" replace />
            }
          />

          <Route
            path="/marketing-spends"
            element={
              isManager
                ? <MarketingSpends />
                : <Navigate to="/" replace />
            }
          />

          <Route path="/handoffs" element={<Handoffs />} />
          <Route path="/properties" element={<PropertyFactSheets />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
