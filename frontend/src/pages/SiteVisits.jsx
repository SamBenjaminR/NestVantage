
import { useCallback, useEffect, useState } from 'react'

import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react'

import {
  getAllBookings,
  cancelBooking as cancelBookingApi,
  updateVisitStatus,
} from '../services/siteVisitService'

// Convert Java LocalTime into a readable 12-hour time.
function toDisplayTime(time) {
  if (!time) return ''

  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

function mapBooking(booking) {
  return {
    id: booking.id,
    visitCode: booking.visitCode,
    name: booking.lead?.buyerName || 'Unknown buyer',
    project: booking.projectName || 'Project not specified',
    date: booking.visitDate,
    time: toDisplayTime(booking.visitTime),
    status: booking.status || 'Booked',
    locationUrl: booking.locationUrl,
  }
}

function SiteVisits() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  // Load all site visits from the backend.
  const loadBookings = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const bookingData = await getAllBookings()
      setBookings(bookingData.map(mapBooking))
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to load site visits. Please check the backend.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  // Cancel a booking without deleting its history.
  async function cancelBooking(bookingId) {
    setError('')
    setUpdatingId(bookingId)

    try {
      await cancelBookingApi(bookingId)

      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: 'Cancelled' }
            : booking
        )
      )
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to cancel this booking. Please try again.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  // Update a visit to Completed or No Show.
  async function handleVisitStatus(bookingId, status) {
    setError('')
    setUpdatingId(bookingId)

    try {
      await updateVisitStatus(bookingId, status)

      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status }
            : booking
        )
      )
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to update visit status. Please try again.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const totalBookings = bookings.length
  const bookedCount = bookings.filter(
    (booking) => booking.status === 'Booked'
  ).length
  const completedCount = bookings.filter(
    (booking) => booking.status === 'Completed'
  ).length
  const noShowCount = bookings.filter(
    (booking) => booking.status === 'No Show'
  ).length
  const cancelledCount = bookings.filter(
    (booking) => booking.status === 'Cancelled'
  ).length

  return (
    <main className="min-w-0 flex-1 bg-slate-50 p-8">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Site Visit Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View buyer bookings and manage site visit statuses.
          </p>
        </div>

        <button
          onClick={() => loadBookings(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading site visits...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Total Bookings
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalBookings}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-blue-600">
                Booked
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-700">
                {bookedCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-green-600">
                Completed
              </p>
              <p className="mt-2 text-2xl font-bold text-green-700">
                {completedCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-orange-600">
                No Show
              </p>
              <p className="mt-2 text-2xl font-bold text-orange-700">
                {noShowCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Cancelled
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-700">
                {cancelledCount}
              </p>
            </div>

          </div>

          {/* Site Visit Records */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                All Site Visits
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Buyer bookings received through the buyer booking page.
              </p>
            </div>

            {bookings.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarDays
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No site visits found.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Buyer bookings will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >

                    {/* Buyer and Project */}
                    <div className="flex flex-wrap items-start justify-between gap-3">

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {booking.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {booking.project}
                        </p>
                      </div>

                      {/* Status */}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          booking.status === 'Booked'
                            ? 'bg-blue-50 text-blue-700'
                            : booking.status === 'Completed'
                            ? 'bg-green-50 text-green-700'
                            : booking.status === 'No Show'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {booking.status}
                      </span>

                    </div>

                    {/* Visit Details */}
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">

                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={16} />
                        {booking.date}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <Clock size={16} />
                        {booking.time}
                      </span>

                    </div>

                    {/* Booking ID */}
                    <p className="mt-3 text-xs text-slate-400">
                      Booking ID: {booking.visitCode || booking.id}
                    </p>

                    {/* Location */}
                    {booking.locationUrl && (
                      <a
                        href={booking.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <MapPin size={16} />
                        View Location
                      </a>
                    )}

                    {/* Staff Actions */}
                    {booking.status === 'Booked' && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">

                        <button
                          onClick={() =>
                            handleVisitStatus(booking.id, 'Completed')
                          }
                          disabled={updatingId === booking.id}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                        >
                          <CheckCircle2 size={15} />
                          Completed
                        </button>

                        <button
                          onClick={() =>
                            handleVisitStatus(booking.id, 'No Show')
                          }
                          disabled={updatingId === booking.id}
                          className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
                        >
                          No Show
                        </button>

                        <button
                          onClick={() => cancelBooking(booking.id)}
                          disabled={updatingId === booking.id}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle size={15} />
                          Cancel Visit
                        </button>

                      </div>
                    )}

                    {updatingId === booking.id && (
                      <p className="mt-2 text-xs text-slate-400">
                        Updating visit status...
                      </p>
                    )}

                  </div>
                ))}

              </div>
            )}

          </section>
        </>
      )}
    </main>
  )
}

export default SiteVisits
