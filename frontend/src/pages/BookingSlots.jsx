
import { useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Clock,
  X,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import {
  getAllBookingSlots,
  createBookingSlot,
  updateBookingSlot,
  deleteBookingSlot,
} from '../services/bookingSlotService'

const emptyForm = {
  projectName: '',
  slotTime: '',
  active: true,
}

export default function BookingSlots() {
  const { user } = useAuth()

  const isManager =
    user?.role === 'ADMIN' || user?.role === 'SALES_HEAD'

  const [slots, setSlots] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadSlots = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getAllBookingSlots()
      setSlots(data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to load booking slots.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlots()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleEdit = (slot) => {
    setEditingId(slot.id)

    setForm({
      projectName: slot.projectName || '',
      slotTime: slot.slotTime || '',
      active: slot.active,
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const slotData = {
        projectName: form.projectName.trim(),
        slotTime: form.slotTime.trim().toUpperCase(),
        active: form.active,
      }

      if (editingId) {
        await updateBookingSlot(editingId, slotData)
        setSuccess('Booking slot updated successfully.')
      } else {
        await createBookingSlot(slotData)
        setSuccess('Booking slot created successfully.')
      }

      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)

      await loadSlots()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to save booking slot. Check the project name and time format.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (slot) => {
    try {
      setError('')
      setSuccess('')

      await updateBookingSlot(slot.id, {
        projectName: slot.projectName,
        slotTime: slot.slotTime,
        active: !slot.active,
      })

      setSuccess(
        `Slot ${!slot.active ? 'activated' : 'deactivated'} successfully.`
      )

      await loadSlots()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to update booking slot status.'
      )
    }
  }

  const handleDelete = async (slot) => {
    const confirmed = window.confirm(
      `Delete ${slot.slotTime} for ${slot.projectName}?`
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await deleteBookingSlot(slot.id)

      setSuccess('Booking slot deleted successfully.')
      await loadSlots()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to delete booking slot.'
      )
    }
  }

  const groupedSlots = slots.reduce((groups, slot) => {
    if (!groups[slot.projectName]) {
      groups[slot.projectName] = []
    }

    groups[slot.projectName].push(slot)
    return groups
  }, {})

  if (!isManager) {
    return (
      <main className="p-6">
        <p className="rounded-xl border bg-white p-6 text-gray-600">
          You do not have permission to manage booking slots.
        </p>
      </main>
    )
  }

  return (
    <main className="min-w-0 flex-1 space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Booking Slots
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage site visit appointment times for each project.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadSlots}
            className="flex items-center gap-2 rounded-lg border px-4 py-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              setForm(emptyForm)
              setEditingId(null)
              setError('')
              setSuccess('')
              setShowForm(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Slot
          </button>
        </div>
      </div>

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

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Booking Slot' : 'Add Booking Slot'}
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Project Name
              </label>

              <input
                name="projectName"
                value={form.projectName}
                onChange={handleChange}
                placeholder="Example: Project 1"
                required
                maxLength={150}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Appointment Time
              </label>

              <input
                name="slotTime"
                value={form.slotTime}
                onChange={handleChange}
                placeholder="Example: 10:00 AM"
                required
                pattern="(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)"
                title="Use 12-hour format, e.g. 10:00 AM or 02:00 PM"
                className="w-full rounded-lg border px-3 py-2"
              />

              <p className="mt-1 text-xs text-gray-500">
                Use 12-hour format, such as 10:00 AM or 02:00 PM.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            Active (available for site visit booking)
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Slot'
                  : 'Save Slot'}
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

      {loading ? (
        <p className="text-gray-500">Loading booking slots...</p>
      ) : slots.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-gray-500">
          <Clock size={28} className="mb-2" />
          No booking slots configured yet.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSlots).map(([projectName, projectSlots]) => (
            <section
              key={projectName}
              className="space-y-3 rounded-xl border bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {projectName}
                </h2>

                <span className="text-sm text-gray-500">
                  {projectSlots.filter((slot) => slot.active).length} active
                  / {projectSlots.length} total slots
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projectSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-semibold text-gray-800">
                        <Clock size={17} className="text-blue-600" />
                        {slot.slotTime}
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          slot.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {slot.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Slot ID: {slot.id}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(slot)}
                        className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggle(slot)}
                        className="rounded-lg border px-3 py-2 text-xs"
                      >
                        {slot.active ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(slot)}
                        className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
