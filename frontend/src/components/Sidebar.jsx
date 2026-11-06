
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Settings,
  Building2,
  Handshake,
  FileText,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Leads', icon: Users, path: '/leads' },
  { name: 'Site Visits', icon: CalendarDays, path: '/visits' },
  { name: 'AI Conversations', icon: MessageSquare, path: '/conversations' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Sales Handoffs', icon: Handshake, path: '/handoffs' },
  { name: 'Property Fact Sheets', icon: FileText, path: '/properties' },
]

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5">

      <div className="mb-10 flex items-center gap-3">
        <div className="rounded-xl bg-blue-600 p-2 text-white">
          <Building2 size={23} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            NestVantage
          </h1>
          <p className="text-xs text-slate-500">
            Real Estate Intelligence
          </p>
        </div>
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Workspace
      </p>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
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

      <div className="border-t border-slate-200 pt-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-slate-100">
          <Settings size={19} />
          Settings
        </button>

        <div className="mt-5 rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">
            Sales Team
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Company A · Ahmedabad
          </p>
        </div>
      </div>

    </aside>
  )
}

export default Sidebar
