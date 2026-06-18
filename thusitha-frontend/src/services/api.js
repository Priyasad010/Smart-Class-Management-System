const API_URL = import.meta.env.VITE_API_URL;

export const request = async (endpoint, { body, isFormData = false, ...customConfig } = {}) => {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body && !isFormData) {
    config.body = JSON.stringify(body);
  } else if (body && isFormData) {
    config.body = body; // For FormData, browser sets Content-Type
  }

  // Ensure endpoint starts with /api if it's not already there
  const fullUrl = endpoint.startsWith('/api') ? `${API_URL}${endpoint}` : `${API_URL}/api${endpoint}`;

  const response = await fetch(fullUrl, config);

  if (!response.ok) {
    const contentType = response.headers.get('content-type'); // Get Content-Type header
    if (contentType?.includes('application/json')) { // Use optional chaining
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    } else {
      throw new Error(`API Error: ${response.status} - Server returned non-JSON response.`);
    }
  }

  return await response.json();
};