import { useEffect, useState } from 'react'

import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

import { getAllLeads } from '../services/leadService'
import {
  getAllBookings,
  createBooking,
  cancelBooking as cancelBookingApi,
  updateVisitStatus,
} from '../services/siteVisitService'

const timeSlots = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
]

function getTomorrow() {
  const date = new Date()
  date.setDate(date.getDate() + 1)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Convert "10:00 AM" into the LocalTime format expected by Java.
function toApiTime(time) {
  const [clock, period] = time.split(' ')
  let [hours, minutes] = clock.split(':').map(Number)

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
}

// Convert Java's LocalTime response into a readable time.
function toDisplayTime(time) {
  if (!time) return ''

  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

// Convert a backend booking into the format used by this page.
function mapBooking(booking) {
  return {
    id: booking.id,
    visitCode: booking.visitCode,
    leadId: booking.lead?.id,
    name: booking.lead?.buyerName || 'Unknown buyer',
    project: booking.projectName,
    date: booking.visitDate,
    time: toDisplayTime(booking.visitTime),
    status: booking.status || 'Booked',
  }
}

function SiteVisits() {
  const [leads, setLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTomorrow())
  const [selectedTime, setSelectedTime] = useState('')

  const [bookings, setBookings] = useState([])
  const [confirmation, setConfirmation] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load buyers and bookings from the backend.
  async function loadPageData() {
    setLoading(true)
    setError('')

    try {
      const [leadData, bookingData] = await Promise.all([
        getAllLeads(),
        getAllBookings(),
      ])

      setLeads(leadData)
      setBookings(bookingData.map(mapBooking))
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to load buyers and bookings. Please check the backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const currentLead = leads.find(
    (lead) => String(lead.id) === selectedLead
  )

  // Check whether the selected project's slot is booked.
  function isSlotBooked(time) {
  if (!currentLead) return false

  return bookings.some(
    (booking) =>
      booking.project === currentLead.projectName &&
      booking.date === selectedDate &&
      booking.time === time &&
      booking.status === 'Booked'
  )
}

  const availableSlots = timeSlots.filter(
    (time) => !isSlotBooked(time)
  )

  // Create a booking through the backend.
  async function handleBooking() {
    if (!selectedLead || !selectedDate || !selectedTime) {
      setError('Please select a buyer, date and time slot.')
      return
    }

    if (isSlotBooked(selectedTime)) {
      setError('This time slot is already booked. Please choose another.')
      setSelectedTime('')
      return
    }

    setSubmitting(true)
    setError('')
    setConfirmation(null)

    try {
      const bookingData = {
        leadId: Number(selectedLead),
        projectName: currentLead.projectName,
        visitDate: selectedDate,
        visitTime: toApiTime(selectedTime),
      }

      const response = await createBooking(bookingData)
      const newBooking = mapBooking(response)

      setBookings((previous) => [...previous, newBooking])
      setConfirmation(newBooking)
      setSelectedTime('')
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to book this visit. Please try again.'
      )

      // Refresh bookings in case another request booked this slot.
      try {
        const latestBookings = await getAllBookings()
        setBookings(latestBookings.map(mapBooking))
      } catch {
        // Keep the original error visible.
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Cancel a booking through the backend.
  async function cancelBooking(bookingId) {
    setError('')

    try {
      await cancelBookingApi(bookingId)

      // Update the booking status without removing its history.
          setBookings((previous) =>
          previous.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: 'Cancelled' }
            :  booking
          ) 
        )

      if (confirmation?.id === bookingId) {
        setConfirmation(null)
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to cancel this booking. Please try again.'
      )
    }
  }
        
// Mark a booking as Completed or No Show.
async function handleVisitStatus(bookingId, status) {
  setError('')

  try {
    await updateVisitStatus(bookingId, status)

    // Preserve the actual status selected by the user.
    setBookings((previous) =>
      previous.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: status }
          : booking
      )
    )
  } catch (err) {
    setError(
      err.response?.data?.error ||
      'Unable to update visit status. Please try again.'
    )
  }
}


  return (
    <main className="min-w-0 flex-1 bg-slate-50 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Site Visit Booking
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Schedule and manage property site visits.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading buyers and bookings...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* Booking Form */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-2">

            <h2 className="mb-6 text-lg font-semibold text-slate-900">
              Book a Site Visit
            </h2>

            {/* Select Lead */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select Buyer
              </label>

              <select
                value={selectedLead}
                onChange={(event) => {
                  setSelectedLead(event.target.value)
                  setSelectedTime('')
                  setConfirmation(null)
                  setError('')
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Choose a buyer</option>

                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.buyerName} — {lead.leadCode}
                  </option>
                ))}
              </select>

              {currentLead && (
                <div className="mt-3 rounded-lg bg-blue-50 p-3">
                  <p className="font-medium text-blue-900">
                    {currentLead.buyerName}
                  </p>

                  <p className="mt-1 text-xs text-blue-700">
                    {currentLead.projectName} · {currentLead.bhkType}
                  </p>
                </div>
              )}
            </div>

            {/* Select Date */}
            <div className="mb-6">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays size={17} />
                Select Visit Date
              </label>

              <input
                type="date"
                value={selectedDate}
                min={getTomorrow()}
                onChange={(event) => {
                  setSelectedDate(event.target.value)
                  setSelectedTime('')
                  setConfirmation(null)
                  setError('')
                }}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Select Time */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Clock size={17} />
                  Available Time Slots
                </label>

                <span className="text-xs text-green-600">
                  {currentLead ? availableSlots.length : 0} slots available
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {timeSlots.map((time) => {
                  const booked = isSlotBooked(time)
                  const selected = selectedTime === time

                  return (
                    <button
                      key={time}
                      disabled={!currentLead || booked}
                      onClick={() => {
                        setSelectedTime(time)
                        setError('')
                      }}
                      className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                        booked
                          ? 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400 line-through'
                          : selected
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300'
                      }`}
                    >
                      {time}

                      {booked && (
                        <span className="mt-1 block text-xs no-underline">
                          Booked
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Location */}
            <div className="mb-6 rounded-lg bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPin size={18} />
                Site Visit Location
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Company A – Project Site, Ahmedabad
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Demo location. Actual site address and map pin
                will be configured by the administrator.
              </p>
            </div>

            {/* Booking Button */}
            <button
              onClick={handleBooking}
              disabled={
                !selectedLead ||
                !selectedDate ||
                !selectedTime ||
                submitting
              }
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? 'Booking...' : 'Confirm Site Visit'}
            </button>

            {/* Confirmation */}
            {confirmation && (
              <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 size={20} />

                  <p className="font-semibold">
                    Site Visit Booked Successfully!
                  </p>
                </div>

                <p className="mt-2 text-sm text-green-800">
                  {confirmation.name}
                </p>

                <p className="mt-1 text-sm text-green-700">
                  {confirmation.date} · {confirmation.time}
                </p>

                <p className="mt-1 text-xs text-green-700">
                  Booking ID: {confirmation.visitCode}
                </p>
              </div>
            )}

          </section>

          {/* Booking Summary */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">

            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Booking Summary
            </h2>

            <div className="mb-6 grid grid-cols-2 gap-3">

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-xs text-blue-600">
                  Total Bookings
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-900">
                  {bookings.length}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-xs text-green-600">
                  Available Slots
                </p>

                <p className="mt-2 text-2xl font-bold text-green-900">
                  {currentLead ? availableSlots.length : '—'}
                </p>
              </div>

            </div>

            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Recent Bookings
            </h3>

            {bookings.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarDays
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-500">
                  No bookings yet.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Confirm a site visit to see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">

                {bookings.map((booking) => (
  <div
    key={booking.id}
    className="rounded-lg border border-slate-200 p-3"
  >
    {/* Buyer and Project Details */}
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {booking.name}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {booking.project}
        </p>
      </div>
    </div>

    {/* Booking Actions */}
                  {/* Booking Status and Actions */}
<div className="mt-3 flex flex-wrap items-center gap-2">
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

  {booking.status === 'Booked' && (
    <>
      <button
        onClick={() => handleVisitStatus(booking.id, 'Completed')}
        className="rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
      >
        Completed
      </button>

      <button
        onClick={() => handleVisitStatus(booking.id, 'No Show')}
        className="rounded-md bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100"
      >
        No Show
      </button>

      <button
        onClick={() => cancelBooking(booking.id)}
        title="Cancel booking"
        className="text-red-500 hover:text-red-700"
      >
        <XCircle size={18} />
      </button>
    </>
  )}
</div>

    <p className="mt-3 text-xs text-slate-600">
      {booking.date} · {booking.time}
    </p>

    <p className="mt-1 text-xs text-slate-400">
      {booking.visitCode}
    </p>
  </div>
))}

              </div>
            )}

          </section>

        </div>
      )}
    </main>
  )
}

export default SiteVisits