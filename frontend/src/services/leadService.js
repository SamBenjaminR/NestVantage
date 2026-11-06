import axios from 'axios';

// Base URL of our Spring Boot backend
const API_URL = 'http://localhost:8080/api/leads';

// Retrieve all leads from the backend
export const getAllLeads = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Retrieve one lead using its database ID
export const getLeadById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// Create a new lead
export const createLead = async (leadData) => {
    const response = await axios.post(API_URL, leadData);
    return response.data;
};
export const updateLead = async (id, leadData) => {
  const response = await axios.put(`${API_URL}/${id}`, leadData)
  return response.data
}
// Delete a lead
export const deleteLead = async (id) => {
  await axios.delete(`${API_URL}/${id}`)
}