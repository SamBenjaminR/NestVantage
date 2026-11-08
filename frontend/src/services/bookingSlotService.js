import api from '../api/axiosConfig'

const API_URL = '/booking-slots'

// Get all booking slots
export const getAllBookingSlots = async () => {
  const response = await api.get(API_URL)
  return response.data
}

// Create a booking slot
export const createBookingSlot = async (slotData) => {
  const response = await api.post(API_URL, slotData)
  return response.data
}

// Update a booking slot
export const updateBookingSlot = async (id, slotData) => {
  const response = await api.put(`${API_URL}/${id}`, slotData)
  return response.data
}

// Delete a booking slot
export const deleteBookingSlot = async (id) => {
  await api.delete(`${API_URL}/${id}`)
}