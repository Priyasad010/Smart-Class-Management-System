const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const request = async (endpoint, options = {}) => {
  // LocalStorage එකෙන් Token එක ලබා ගැනීම
  const token = localStorage.getItem('token');

  const headers = {
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...(token && { 'Authorization': `Bearer ${token}` }), // Token එක තිබේ නම් පමණක් එකතු කරයි
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Response එක සාර්ථක නැත්නම් Error එකක් throw කිරීම
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // Response එකේ ඩේටා නැතිනම් (204 No Content වගේ නම්) හිස්ව යැවීම
    if (response.status === 204) return null;
    
    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error; // 💡 SonarQube S2486 වලට අනුව Exception එක නිවැරදිව throw කිරීම
  }
};