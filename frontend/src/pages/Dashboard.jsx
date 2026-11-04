
import {
  Users,
  CalendarCheck,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Search,
  Bell,
  Plus,
} from 'lucide-react'

const stats = [
  {
    title: 'Total Leads',
    value: '3,000',
    change: '+12.5%',
    icon: Users,
    color: 'blue',
  },
  {
    title: 'Site Visits Booked',
    value: '240',
    change: '+8.2%',
    icon: CalendarCheck,
    color: 'green',
  },
  {
    title: 'Avg. Response Time',
    value: '2 min',
    change: 'Target < 5 min',
    icon: Clock,
    color: 'orange',
  },
  {
    title: 'Visit Conversion',
    value: '8%',
    change: '+2% target',
    icon: TrendingUp,
    color: 'purple',
  },
]

const leads = [
  {
    id: 'LD-58210',
    name: 'Hardik Patel',
    source: 'Property Portal',
    project: 'Project 1',
    status: 'Visit Booked',
    color: 'green',
  },
  {
    id: 'LD-58211',
    name: 'Nidhi Shah',
    source: 'Social Media',
    project: 'Project 2',
    status: 'New Lead',
    color: 'blue',
  },
  {
    id: 'LD-58224',
    name: 'Kavita Joshi',
    source: 'Hoarding Call',
    project: 'Project 2',
    status: 'Visited',
    color: 'purple',
  },
]

function Dashboard() {
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
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600">
            <Search size={19} />
          </button>

          <button className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600">
            <Bell size={19} />
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
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

              <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                <ArrowUpRight size={14} className="text-green-600" />
                {stat.change}
              </div>
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
              Latest enquiries from all sources
            </p>
          </div>

          <button className="text-sm font-medium text-blue-600">
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
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {lead.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {lead.id}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {lead.source}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {lead.project}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </main>
  )
}

export default Dashboard
