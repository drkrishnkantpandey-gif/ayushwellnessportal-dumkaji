// Single source of truth for the backend URL.
// Set VITE_API_BASE_URL in .env.production to your actual server (no trailing slash).
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
export default API;
