
import axios from 'axios'

const API_URL = 'http://localhost:8080/api/site-visits'

export const getAllBookings = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

export const getVisitHistory = async () => {
  const response = await axios.get(`${API_URL}/history`)
  return response.data
}

export const createBooking = async (bookingData) => {
  const response = await axios.post(API_URL, bookingData)
  return response.data
}

export const cancelBooking = async (id) => {
  await axios.delete(`${API_URL}/${id}`)
}

export const updateVisitStatus = async (id, status) => {
  await axios.patch(`${API_URL}/${id}/status`, { status })
}