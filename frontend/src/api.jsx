// API utility for React Query and Axios (if needed for custom hooks)
import axios from 'axios';

export const api = axios.create({
  baseURL: '/',
});
