
import api from '../api/axiosConfig'

export const getAllMarketingSpends = async () => {
  const response = await api.get('/marketing-spends')
  return response.data
}

export const getMarketingSpendsByMonth = async (month) => {
  const response = await api.get(`/marketing-spends/month/${month}`)
  return response.data
}

export const createMarketingSpend = async (data) => {
  const response = await api.post('/marketing-spends', data)
  return response.data
}

export const updateMarketingSpend = async (id, data) => {
  const response = await api.put(`/marketing-spends/${id}`, data)
  return response.data
}

export const deleteMarketingSpend = async (id) => {
  const response = await api.delete(`/marketing-spends/${id}`)
  return response.data
}
