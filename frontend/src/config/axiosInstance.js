// Shared axios instance — base URL from env, credentials included for httpOnly cookies
import axios from "axios";
import API from "./api";

const instance = axios.create({
  baseURL: API,
  withCredentials: true,  // send httpOnly cookie on every request
});

// Attach Bearer token from localStorage as fallback for cross-domain Render deployments
// where SameSite: strict prevents cookies from being sent cross-domain
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default instance;
export { API };
