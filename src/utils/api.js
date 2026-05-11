// Get the API base URL based on environment
const getApiBaseUrl = () => {
  // Use Vite's import.meta.env for environment variables
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback for production (Vercel): use relative URLs
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  
  return ''; // Use relative URLs in production (e.g., /api/chat)
};

export const API_BASE_URL = getApiBaseUrl();

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
