
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  X,
  Menu,
  Building2,
  BellRing,
  Phone,
  MapPin,
  CalendarClock,
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import { connectHandoffSocket } from '../services/handoffSocket'

function DashboardLayout() {
  const [notification, setNotification] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const disconnect = connectHandoffSocket((newNotification) => {
      setNotification(newNotification)
      setNotifications((previous) =>
        [newNotification, ...previous].slice(0, 20)
      )
    })

    return () => {
      disconnect()
    }
  }, [])

  const isSiteVisitReminder =
    notification?.type === 'SITE_VISIT_REMINDER'

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen md:flex">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />

      <div className="min-w-0 flex-1">
        {/* Mobile top navigation */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Menu size={23} />
            </button>

            <div className="flex min-w-0 items-center gap-2">
              <div className="shrink-0 rounded-lg bg-blue-600 p-2 text-white">
                <Building2 size={19} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-900">
                  NestVantage
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  Real Estate Intelligence
                </p>
              </div>
            </div>
          </div>

          <span className="shrink-0 text-xs font-medium text-slate-500">
            Company A
          </span>
        </header>

        <Outlet context={{ notifications }} />
      </div>

      {/* Real-time notification */}
      {notification && (
        <div className="fixed left-3 right-3 top-16 z-[70] w-auto rounded-xl border border-blue-200 bg-white p-4 shadow-2xl sm:left-auto sm:right-6 sm:top-6 sm:w-full sm:max-w-md sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {isSiteVisitReminder ? (
                <CalendarClock
                  className="shrink-0 text-blue-600"
                  size={22}
                />
              ) : (
                <BellRing
                  className="shrink-0 text-blue-600"
                  size={22}
                />
              )}

              <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                {isSiteVisitReminder
                  ? `${notification.reminderType} Site Visit Reminder`
                  : 'New Human Handoff Request'}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setNotification(null)}
              className="shrink-0 text-gray-500 hover:text-gray-900"
              aria-label="Dismiss notification"
            >
              <X size={20} />
            </button>
          </div>

          {isSiteVisitReminder ? (
            <div className="mt-4 space-y-2 break-words text-sm text-gray-700">
              <p>
                <strong>Buyer:</strong> {notification.buyerName}
              </p>
              <p>
                <strong>Project:</strong> {notification.projectName}
              </p>
              <p>
                <strong>Date:</strong> {notification.visitDate}
              </p>
              <p>
                <strong>Time:</strong> {notification.visitTime}
              </p>

              {notification.locationUrl && (
                <a
                  href={notification.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <MapPin size={16} />
                  View location on Google Maps
                </a>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-2 break-words text-sm text-gray-700">
              <p>
                <strong>Buyer:</strong> {notification.buyerName}
              </p>

              <p className="flex items-center gap-2">
                <Phone size={15} />
                {notification.phone}
              </p>

              <p>
                <strong>Assigned to:</strong>{' '}
                {notification.executiveName}
              </p>

              <p>
                <strong>Status:</strong> {notification.status}
              </p>

              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <strong>Conversation Summary</strong>
                <p className="mt-1 whitespace-pre-wrap break-words text-gray-600">
                  {notification.summary}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setNotification(null)}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

export default DashboardLayout
