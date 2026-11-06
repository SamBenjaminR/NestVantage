
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X, BellRing, Phone } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { connectHandoffSocket } from '../services/handoffSocket'

function DashboardLayout() {
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    const disconnect = connectHandoffSocket((newNotification) => {
      setNotification(newNotification)
    })

    return () => {
      disconnect()
    }
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <Outlet />

      {notification && (
        <div className="fixed right-6 top-6 z-50 w-full max-w-md rounded-xl border border-blue-200 bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <BellRing className="text-blue-600" size={22} />
              <h3 className="font-semibold text-gray-900">
                New Human Handoff Request
              </h3>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-900"
              aria-label="Dismiss notification"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-700">
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
              <p className="mt-1 whitespace-pre-wrap text-gray-600">
                {notification.summary}
              </p>
            </div>
          </div>

          <button
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
