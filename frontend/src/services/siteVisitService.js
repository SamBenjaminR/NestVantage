
import api from '../api/axiosConfig'

const API_URL = '/site-visits'
const SLOT_API_URL = '/booking-slots'

// Site visit bookings
export const getAllBookings = async () => {
  const response = await api.get(API_URL)
  return response.data
}

export const getVisitHistory = async () => {
  const response = await api.get(`${API_URL}/history`)
  return response.data
}

export const createBooking = async (bookingData) => {
  const response = await api.post(API_URL, bookingData)
  return response.data
}

export const cancelBooking = async (id) => {
  await api.delete(`${API_URL}/${id}`)
}

export const updateVisitStatus = async (id, status) => {
  await api.patch(`${API_URL}/${id}/status`, { status })
}

// Booking slot management
export const getActiveSlotsByProject = async (projectName) => {
  const response = await api.get(
    `${SLOT_API_URL}/project/${encodeURIComponent(projectName)}`
  )
  return response.data
}
