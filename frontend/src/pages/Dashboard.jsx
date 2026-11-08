
import { useEffect, useState } from 'react'
import {
  Users,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  Search,
  Bell,
  Plus,
  RefreshCw,
  X,
  MapPin,
  CalendarClock,
  Phone,
  BellRing,
} from 'lucide-react'

import { useNavigate, useOutletContext } from 'react-router-dom'
import { getAllLeads } from '../services/leadService'
import { getVisitHistory } from '../services/siteVisitService'

function Dashboard() {
  const [leads, setLeads] = useState([])
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const navigate = useNavigate()
  const { notifications = [] } = useOutletContext() || {}

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')

      const [leadData, visitData] = await Promise.all([
        getAllLeads(),
        getVisitHistory(),
      ])

      setLeads(leadData)
      setVisits(visitData)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError(
        'Unable to load dashboard data. Please check the backend connection.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const totalLeads = leads.length
  const totalVisits = visits.length

  const completed = visits.filter(
    visit => visit.status === 'Completed'
  ).length

  const noShow = visits.filter(
    visit => visit.status === 'No Show'
  ).length

  const decidedVisits = completed + noShow

  const showUpRate = decidedVisits > 0
    ? Math.round((completed / decidedVisits) * 100)
    : 0

  const leadsWithVisits = new Set(
    visits
      .filter(visit =>
        ['Booked', 'Completed'].includes(visit.status)
      )
      .map(visit => visit.lead?.id)
      .filter(Boolean)
  ).size

  const visitConversion = totalLeads > 0
    ? Math.round((leadsWithVisits / totalLeads) * 100)
    : 0

  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads,
      description: 'Leads recorded in database',
      icon: Users,
    },
    {
      title: 'Total Site Visits',
      value: totalVisits,
      description: 'All visit records',
      icon: CalendarCheck,
    },
    {
      title: 'Completed Visits',
      value: completed,
      description: 'Successfully completed',
      icon: CheckCircle2,
    },
    {
      title: 'Visit Conversion',
      value: `${visitConversion}%`,
      description: `${leadsWithVisits} leads with visits`,
      icon: TrendingUp,
    },
  ]

  const filteredLeads = [...leads]
    .filter((lead) => {
      const search = searchTerm.trim().toLowerCase()

      if (!search) return true

      return [
        lead.buyerName,
        lead.leadCode,
        lead.phone,
        lead.source,
        lead.projectName,
        lead.status,
      ].some(value =>
        String(value || '').toLowerCase().includes(search)
      )
    })
    .sort((a, b) => {
      if (!a.createdAt) return 1
      if (!b.createdAt) return -1

      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  const recentLeads = searchTerm.trim()
    ? filteredLeads
    : filteredLeads.slice(0, 5)

  if (loading) {
    return (
      <main className="min-w-0 flex-1 bg-slate-50 p-8">
        <p className="text-slate-500">Loading dashboard...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-w-0 flex-1 bg-slate-50 p-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h2>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>

          <button
            onClick={loadDashboard}
            className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-w-0 flex-1 bg-slate-50 p-8">

      {/* Header */}
      <header className="relative mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Welcome back! Here's your sales overview.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Live figures based on records stored in the database.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={loadDashboard}
            title="Refresh dashboard"
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={19} />
          </button>

          {/* Search Button */}
          <button
            onClick={() => {
              setSearchOpen(!searchOpen)
              setNotificationsOpen(false)
              setSearchTerm('')
            }}
            title="Search leads"
            className={`rounded-lg border p-2.5 ${
              searchOpen
                ? 'border-blue-300 bg-blue-50 text-blue-600'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <Search size={19} />
          </button>

          {/* Notification Button */}
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen)
              setSearchOpen(false)
            }}
            title="Notifications"
            className={`relative rounded-lg border p-2.5 ${
              notificationsOpen
                ? 'border-blue-300 bg-blue-50 text-blue-600'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <Bell size={19} />

            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/leads')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Lead
          </button>
        </div>

        {/* Search Panel */}
        {searchOpen && (
          <div className="absolute right-0 top-16 z-40 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                Search Leads
              </h3>

              <button
                onClick={() => {
                  setSearchOpen(false)
                  setSearchTerm('')
                }}
                className="text-slate-500 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3">
              <Search size={17} className="text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, lead ID, phone, source..."
                className="w-full py-2.5 text-sm outline-none"
                autoFocus
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {filteredLeads.length} matching leads
            </p>
          </div>
        )}

        {/* Notification Panel */}
        {notificationsOpen && (
          <div className="absolute right-0 top-16 z-40 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">
                Notifications
              </h3>

              <button
                onClick={() => setNotificationsOpen(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={28} className="mx-auto text-slate-300" />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    New handoffs and site-visit reminders received during this session will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification, index) => {
                    const isReminder =
                      notification.type === 'SITE_VISIT_REMINDER'

                    return (
                      <div
                        key={`${notification.type}-${notification.visitId || notification.handoffId || index}-${index}`}
                        className="rounded-lg border border-slate-200 p-3"
                      >
                        <div className="flex items-center gap-2">
                          {isReminder ? (
                            <CalendarClock size={18} className="text-blue-600" />
                          ) : (
                            <BellRing size={18} className="text-blue-600" />
                          )}

                          <h4 className="text-sm font-semibold text-slate-900">
                            {isReminder
                              ? `${notification.reminderType} Site Visit Reminder`
                              : 'New Human Handoff Request'}
                          </h4>
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                          <p>
                            <strong>Buyer:</strong>{' '}
                            {notification.buyerName || 'Not provided'}
                          </p>

                          {isReminder ? (
                            <>
                              <p>
                                <strong>Project:</strong>{' '}
                                {notification.projectName}
                              </p>

                              <p>
                                <strong>Date:</strong>{' '}
                                {notification.visitDate}
                              </p>

                              <p>
                                <strong>Time:</strong>{' '}
                                {notification.visitTime}
                              </p>

                              {notification.locationUrl && (
                                <a
                                  href={notification.locationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                  <MapPin size={15} />
                                  View location on Google Maps
                                </a>
                              )}
                            </>
                          ) : (
                            <>
                              {notification.phone && (
                                <p className="flex items-center gap-2">
                                  <Phone size={14} />
                                  {notification.phone}
                                </p>
                              )}

                              <p>
                                <strong>Assigned to:</strong>{' '}
                                {notification.executiveName || 'Awaiting assignment'}
                              </p>

                              <p>
                                <strong>Status:</strong>{' '}
                                {notification.status}
                              </p>

                              {notification.summary && (
                                <div className="rounded-lg bg-slate-50 p-3">
                                  <strong>Conversation Summary</strong>
                                  <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">
                                    {notification.summary}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {stat.title}
                </p>

                <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                  <Icon size={20} />
                </div>
              </div>

              <h3 className="mt-4 text-3xl font-bold text-slate-900">
                {stat.value}
              </h3>

              <p className="mt-3 text-xs text-slate-500">
                {stat.description}
              </p>
            </div>
          )
        })}
      </section>

      {/* Recent Leads */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h3 className="font-semibold text-slate-900">
              {searchTerm.trim() ? 'Search Results' : 'Recent Leads'}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {searchTerm.trim()
                ? `${recentLeads.length} matching leads`
                : 'Latest enquiries retrieved from the database'}
            </p>
          </div>

          <button
            onClick={() => navigate('/leads')}
            className="text-sm font-medium text-blue-600"
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Lead</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Project</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {lead.buyerName}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {lead.leadCode}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {lead.source || 'Unknown'}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {lead.projectName || 'Not specified'}
                  </td>

                  <td className="px-5 py-4">
                    
<span
  className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
    (lead.status || 'New Lead') === 'New Lead'
      ? 'bg-blue-50 text-blue-700'
      : 'bg-slate-100 text-slate-800'
  }`}
>
  {lead.status || 'New Lead'}
</span>

                  </td>
                </tr>
              ))}

              {recentLeads.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    {searchTerm.trim()
                      ? 'No matching leads found.'
                      : 'No leads recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </main>
  )
}

export default Dashboard
