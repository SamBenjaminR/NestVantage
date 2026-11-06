
import { useEffect, useState } from 'react'
import {
  Users,
  CalendarDays,
  CheckCircle2,
  UserX,
  TrendingUp,
  Clock,
  BarChart3,
  RefreshCw,
  XCircle,
} from 'lucide-react'

import { getAllLeads } from '../services/leadService'
import { getVisitHistory } from '../services/siteVisitService'

function Analytics() {
  const [leads, setLeads] = useState([])
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAnalytics = async () => {
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
      setError(
        err.response?.data?.message ||
        'Unable to load analytics. Please check whether the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const totalLeads = leads.length
  const totalVisits = visits.length

  const booked = visits.filter(v => v.status === 'Booked').length
  const completed = visits.filter(v => v.status === 'Completed').length
  const noShow = visits.filter(v => v.status === 'No Show').length
  const cancelled = visits.filter(v => v.status === 'Cancelled').length

  // Show-up rate excludes bookings that are still pending or cancelled.
  const decidedVisits = completed + noShow
  const showUpRate = decidedVisits > 0
    ? Math.round((completed / decidedVisits) * 100)
    : 0

  // Percentage of leads that have at least one site visit.
      const leadsWithVisits = new Set(
  visits
    .filter(v =>
      ['Booked', 'Completed'].includes(v.status)
    )
    .map(v => v.lead?.id)
    .filter(Boolean)
    ).size

  const visitConversion = totalLeads > 0
    ? Math.round((leadsWithVisits / totalLeads) * 100)
    : 0

  // Group leads by their acquisition source.
  const sourceCounts = leads.reduce((result, lead) => {
    const source = lead.source || 'Unknown'
    result[source] = (result[source] || 0) + 1
    return result
  }, {})

  const sourceData = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])

  const maxSourceCount = Math.max(
    ...sourceData.map(([, count]) => count),
    1
  )

  const metrics = [
    {
      title: 'Total Leads',
      value: totalLeads,
      description: 'Leads recorded in database',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Total Site Visits',
      value: totalVisits,
      description: 'All visit records',
      icon: CalendarDays,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Completed Visits',
      value: completed,
      description: 'Successfully completed',
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Show-up Rate',
      value: `${showUpRate}%`,
      description: `${completed} completed out of ${decidedVisits} decided visits`,
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Analytics
        </h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Lead and site-visit performance overview
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Based on records currently stored in the database
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <div
              key={metric.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {metric.title}
                </p>
                <div className={`rounded-lg p-2 ${metric.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold text-slate-900">
                {metric.value}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {metric.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Visit Outcomes and Conversion */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Site Visit Outcomes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Breakdown of all recorded visits
          </p>

          <div className="mt-6 space-y-5">
            {[
              { label: 'Booked', value: booked, icon: Clock, color: 'bg-blue-500' },
              { label: 'Completed', value: completed, icon: CheckCircle2, color: 'bg-green-500' },
              { label: 'No Show', value: noShow, icon: UserX, color: 'bg-orange-500' },
              { label: 'Cancelled', value: cancelled, icon: XCircle, color: 'bg-red-500' },
            ].map(item => {
              const percentage = totalVisits > 0
                ? (item.value / totalVisits) * 100
                : 0

              return (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {item.value}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Lead Conversion
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Leads with at least one site visit
          </p>

          <div className="mt-8 flex flex-col items-center">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-slate-100">
              <div
                className="absolute inset-[-14px] rounded-full"
                style={{
                  background: `conic-gradient(#2563eb ${visitConversion}%, #e2e8f0 ${visitConversion}% 100%)`,
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 14px), black calc(100% - 13px))',
                  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 14px), black calc(100% - 13px))',
                }}
              />
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {visitConversion}%
                </p>
                <p className="text-xs text-slate-500">
                  Conversion
                </p>
              </div>
            </div>

            <div className="mt-6 flex w-full justify-around text-center">
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {leadsWithVisits}
                </p>
                <p className="text-xs text-slate-500">
                  Leads with visits
                </p>
              </div>

              <div>
                <p className="text-xl font-bold text-slate-900">
                  {totalLeads}
                </p>
                <p className="text-xs text-slate-500">
                  Total leads
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Sources */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-slate-500" />
          <h2 className="font-semibold text-slate-900">
            Leads by Source
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Number of leads generated by each source
        </p>

        {sourceData.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">
            No lead source data available.
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            {sourceData.map(([source, count]) => (
              <div key={source}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {source}
                  </span>
                  <span className="text-slate-600">
                    {count} leads
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${(count / maxSourceCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Site Visits */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">
          Recent Site Visits
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Latest visit records and their outcomes
        </p>

        {visits.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">
            No site visits recorded yet.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">Visit ID</th>
                  <th className="pb-3 font-medium">Buyer</th>
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {[...visits]
                  .sort((a, b) =>
                    new Date(`${b.visitDate}T${b.visitTime}`) -
                    new Date(`${a.visitDate}T${a.visitTime}`)
                  )
                  .slice(0, 10)
                  .map(visit => (
                    <tr
                      key={visit.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-3 font-medium text-slate-700">
                        {visit.visitCode}
                      </td>
                      <td className="py-3 text-slate-600">
                        {visit.lead?.buyerName || 'Unknown'}
                      </td>
                      <td className="py-3 text-slate-600">
                        {visit.projectName}
                      </td>
                      <td className="py-3 text-slate-600">
                        {visit.visitDate}
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          visit.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : visit.status === 'No Show'
                              ? 'bg-orange-100 text-orange-700'
                              : visit.status === 'Cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                        }`}>
                          {visit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
