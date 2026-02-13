import axios from 'axios';

// API URL 
export const API_URL = 'https://kilimo-backend-betv.onrender.com/'

export const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests 
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};