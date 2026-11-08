
import { useState } from 'react'

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarClock,
  MessageSquare,
  BarChart3,
  Settings,
  Building2,
  Handshake,
  FileText,
  LogOut,
  Sun,
  Moon,
  X,
  IndianRupee,
} from 'lucide-react'

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const menuItems = [
  {
    name: 'Booking Slots',
    icon: CalendarClock,
    path: '/booking-slots',
    roles: ['ADMIN', 'SALES_HEAD'],
  },
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    roles: ['ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE'],
  },
  {
    name: 'Leads',
    icon: Users,
    path: '/leads',
    roles: ['ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE'],
  },
  {
    name: 'Site Visits',
    icon: CalendarDays,
    path: '/visits',
    roles: ['ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE'],
  },
  {
    name: 'AI Conversations',
    icon: MessageSquare,
    path: '/conversations',
    roles: ['ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE'],
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    roles: ['ADMIN', 'SALES_HEAD'],
  },
  {
    name: 'Marketing Spend',
    icon: IndianRupee,
    path: '/marketing-spends',
    roles: ['ADMIN', 'SALES_HEAD'],
  },
  {
    name: 'Sales Handoffs',
    icon: Handshake,
    path: '/handoffs',
    roles: ['ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE'],
  },
  {
    name: 'Property Fact Sheets',
    icon: FileText,
    path: '/properties',
    roles: ['ADMIN', 'SALES_HEAD', 'SALES_EXECUTIVE'],
  },
]

function Sidebar({ isMobileOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [settingsOpen, setSettingsOpen] = useState(false)

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  )

  const handleLogout = () => {
    const confirmed = window.confirm(
      'Are you sure you want to log out of NestVantage?'
    )

    if (confirmed) {
      logout()
      onClose()
      navigate('/login', { replace: true })
    }
  }

  const openSettings = () => {
    setSettingsOpen(true)
    onClose()
  }

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar / Mobile drawer */}
      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen min-h-0 w-72 max-w-[85vw] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white p-5 shadow-xl transition-transform duration-300 md:sticky md:top-0 md:z-auto md:w-64 md:max-w-none md:translate-x-0 md:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="mb-8 flex items-center justify-between gap-3 md:mb-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-xl bg-blue-600 p-2 text-white">
              <Building2 size={23} />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900">
                NestVantage
              </h1>
              <p className="text-xs text-slate-500">
                Real Estate Intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* Account and settings */}
        <div className="mt-4 shrink-0 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={openSettings}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Settings size={19} />
            Settings
          </button>

          <div className="mt-5 rounded-xl bg-slate-50 p-3">
            <p className="break-words text-sm font-semibold text-slate-800">
              {user?.name || 'Sales Team'}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {user?.role === 'ADMIN'
                ? 'Admin'
                : user?.role === 'SALES_HEAD'
                  ? 'Sales Head'
                  : user?.role === 'SALES_EXECUTIVE'
                    ? 'Sales Executive'
                    : 'User'}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Company A · Ahmedabad
            </p>
          </div>
        </div>
      </aside>

      {/* Settings modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2
                  id="settings-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Settings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Customize your NestVantage experience
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                Appearance
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (theme !== 'light') toggleTheme()
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                    theme === 'light'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sun size={19} />
                  Light
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (theme !== 'dark') toggleTheme()
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                    theme === 'dark'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Moon size={19} />
                  Dark
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                Account
              </h3>

              <div className="mb-4 rounded-lg bg-slate-50 p-3">
                <p className="break-words text-sm font-medium text-slate-800">
                  {user?.name}
                </p>
                <p className="mt-1 break-all text-xs text-slate-500">
                  {user?.email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
