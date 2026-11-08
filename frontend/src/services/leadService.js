
import api from '../api/axiosConfig'

const API_URL = '/leads'


export const getAllLeads = async () => {
    const response = await api.get(API_URL)
    return response.data
}

export const getLeadById = async (id) => {
    const response = await api.get(`${API_URL}/${id}`)
    return response.data
}

export const createLead = async (leadData) => {
    const response = await api.post(API_URL, leadData)
    return response.data
}

export const updateLead = async (id, leadData) => {
    const response = await api.put(`${API_URL}/${id}`, leadData)
    return response.data
}


export const deleteLead = async (id) => {
    await api.delete(`${API_URL}/${id}`)
}

export const markAsResponded = async (id) => {
    const response = await api.patch(`${API_URL}/${id}/responded`)
    return response.data
}
