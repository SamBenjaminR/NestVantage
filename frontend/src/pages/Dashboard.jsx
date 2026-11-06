
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
} from 'lucide-react'

import { getAllLeads } from '../services/leadService'
import { getVisitHistory } from '../services/siteVisitService'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [leads, setLeads] = useState([])
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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

  // Calculate metrics using the same logic as Analytics.
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
      color: 'blue',
    },
    {
      title: 'Total Site Visits',
      value: totalVisits,
      description: 'All visit records',
      icon: CalendarCheck,
      color: 'green',
    },
    {
      title: 'Completed Visits',
      value: completed,
      description: 'Successfully completed',
      icon: CheckCircle2,
      color: 'orange',
    },
    {
      title: 'Visit Conversion',
      value: `${visitConversion}%`,
      description: `${leadsWithVisits} leads with visits`,
      icon: TrendingUp,
      color: 'purple',
    },
  ]

  // Display the latest database records.
  const recentLeads = [...leads]
    .sort((a, b) => {
      if (!a.createdAt) return 1
      if (!b.createdAt) return -1

      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    .slice(0, 5)

  if (loading) {
    return (
      <main className="min-w-0 flex-1 bg-slate-50 p-8">
        <p className="text-slate-500">
          Loading dashboard...
        </p>
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
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
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

          <button className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600">
            <Search size={19} />
          </button>

          <button className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600">
            <Bell size={19} />
          </button>

          <button
            onClick={() => navigate('/leads')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
              Add Lead
          </button>
        </div>
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
              Recent Leads
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Latest enquiries retrieved from the database
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
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
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
                    No leads recorded yet.
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
