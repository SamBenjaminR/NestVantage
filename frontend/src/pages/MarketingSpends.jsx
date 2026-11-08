
import { useEffect, useState } from 'react'

import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  IndianRupee,
  X,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

import {
  getAllMarketingSpends,
  createMarketingSpend,
  updateMarketingSpend,
  deleteMarketingSpend,
} from '../services/marketingSpendService'

const getCurrentMonth = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const emptyForm = {
  source: '',
  spendMonth: getCurrentMonth(),
  amount: '',
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0))

export default function MarketingSpends() {
  const { user } = useAuth()

  const isManager =
    user?.role === 'ADMIN' || user?.role === 'SALES_HEAD'

  const [spends, setSpends] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [editingId, setEditingId] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load marketing expenses.
  const loadSpends = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getAllMarketingSpends()
      setSpends(data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to load marketing expenses.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSpends()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleEdit = (spend) => {
    setEditingId(spend.id)

    setForm({
      source: spend.source || '',
      spendMonth: spend.spendMonth || selectedMonth,
      amount: String(spend.amount ?? ''),
    })

    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const handleCancel = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const amount = Number(form.amount)

    if (!Number.isFinite(amount) || amount < 0) {
      setError('Enter a valid non-negative marketing expense.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const spendData = {
        source: form.source.trim(),
        spendMonth: form.spendMonth,
        amount,
      }

      if (editingId) {
        await updateMarketingSpend(editingId, spendData)
        setSuccess('Marketing expense updated successfully.')
      } else {
        await createMarketingSpend(spendData)
        setSuccess('Marketing expense added successfully.')
      }

      setSelectedMonth(form.spendMonth)
      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)

      await loadSpends()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to save marketing expense. A record for this source and month may already exist.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (spend) => {
    const confirmed = window.confirm(
      `Delete the ${formatCurrency(spend.amount)} expense for ${spend.source} (${spend.spendMonth})?`
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await deleteMarketingSpend(spend.id)

      setSuccess('Marketing expense deleted successfully.')
      await loadSpends()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to delete marketing expense.'
      )
    }
  }

  const filteredSpends = spends.filter(
    (spend) => spend.spendMonth === selectedMonth
  )

  const totalSpend = filteredSpends.reduce(
    (total, spend) => total + Number(spend.amount || 0),
    0
  )

  if (!isManager) {
    return (
      <main className="p-6">
        <p className="rounded-xl border bg-white p-6 text-gray-600">
          You do not have permission to manage marketing expenses.
        </p>
      </main>
    )
  }

  return (
    <main className="min-w-0 flex-1 space-y-6 p-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Marketing Spend
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Record and manage monthly advertising expenses by lead source.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadSpends}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({
                ...emptyForm,
                spendMonth: selectedMonth,
              })
              setEditingId(null)
              setError('')
              setSuccess('')
              setShowForm(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {String(error)}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Month Filter */}
      <section className="rounded-xl border bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Expense Month
        </label>

        <input
          type="month"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          className="w-full max-w-xs rounded-lg border px-3 py-2"
        />
      </section>

      {/* Total Spend */}
      <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-center gap-2 text-blue-700">
          <IndianRupee size={20} />
          <p className="text-sm font-medium">
            Total Marketing Spend
          </p>
        </div>

        <p className="mt-2 text-2xl font-bold text-blue-900">
          {formatCurrency(totalSpend)}
        </p>

        <p className="mt-1 text-xs text-blue-700">
          {selectedMonth} · {filteredSpends.length} source records
        </p>
      </section>

      {/* Add/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Marketing Expense' : 'Add Marketing Expense'}
            </h2>

            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close form"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={19} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Lead Source
              </label>

              <input
                name="source"
                value={form.source}
                onChange={handleChange}
                placeholder="Example: Google Ads"
                required
                maxLength={100}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Expense Month
              </label>

              <input
                type="month"
                name="spendMonth"
                value={form.spendMonth}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Marketing Expense (₹)
              </label>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Example: 50000"
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Expense'
                  : 'Save Expense'}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border px-5 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Expense Records */}
      <section className="space-y-4 rounded-xl border bg-white p-5">

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Marketing Expense Records
          </h2>

          <span className="text-sm text-gray-500">
            {selectedMonth}
          </span>
        </div>

        {loading ? (
          <p className="py-6 text-center text-gray-500">
            Loading marketing expenses...
          </p>
        ) : filteredSpends.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <IndianRupee size={30} className="mx-auto mb-3 text-gray-300" />

            <p className="text-sm font-medium">
              No marketing expenses recorded for this month.
            </p>

            <p className="mt-1 text-xs">
              Add an expense to track cost per completed visit by source.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">

              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-medium">
                    Lead Source
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Month
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Marketing Spend
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSpends.map((spend) => (
                  <tr
                    key={spend.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {spend.source}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {spend.spendMonth}
                    </td>

                    <td className="px-4 py-4 font-semibold text-gray-800">
                      {formatCurrency(spend.amount)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() => handleEdit(spend)}
                          aria-label={`Edit ${spend.source}`}
                          className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(spend)}
                          aria-label={`Delete ${spend.source}`}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="bg-gray-50">
                  <td
                    colSpan="2"
                    className="px-4 py-3 font-semibold text-gray-800"
                  >
                    Monthly Total
                  </td>

                  <td className="px-4 py-3 font-bold text-gray-900">
                    {formatCurrency(totalSpend)}
                  </td>

                  <td />
                </tr>
              </tfoot>

            </table>
          </div>
        )}

      </section>
    </main>
  )
}
