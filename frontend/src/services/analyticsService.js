import api from '../api/axiosConfig'

export const getResponseTimeAnalytics = async () => {
  const response = await api.get('/analytics/response-time')
  return response.data
}

export const getCostPerVisitAnalytics = async (month) => {
  const response = await api.get('/analytics/cost-per-visit', {
    params: { month }
  })
  return response.data
}