import axios from 'axios';

// API URL 
export const API_URL = 'http://192.168.100.4:3000';

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