import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// User APIs
export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  logout: () => api.post('/users/logout'),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  getPreferences: (userId) => api.get(`/users/${userId}/preferences`),
  updatePreferences: (userId, preferences) => api.put(`/users/${userId}/preferences`, preferences),
  getFavorites: (userId) => api.get(`/users/${userId}/favorites`),
  addFavorite: (userId, destination) => api.post(`/users/${userId}/favorites`, destination),
  removeFavorite: (userId, favoriteId) => api.delete(`/users/${userId}/favorites/${favoriteId}`),
  getAlerts: (userId) => api.get(`/users/${userId}/alerts`),
  createAlert: (userId, alertData) => api.post(`/users/${userId}/alerts`, alertData),
  deleteAlert: (userId, alertId) => api.delete(`/users/${userId}/alerts/${alertId}`),
  getNotifications: (userId) => api.get(`/users/${userId}/notifications`),
  markNotificationRead: (userId, notifId) => api.put(`/users/${userId}/notifications/${notifId}/read`),
  markAllNotificationsRead: (userId) => api.put(`/users/${userId}/notifications/read-all`),
};

// Search APIs
export const searchAPI = {
  search: (searchParams) => api.post('/search', searchParams),
  searchPersonalized: (userId, searchParams) => api.post(`/search/user/${userId}`, searchParams),
  getDestinations: () => api.get('/destinations'),
  getAirports: () => api.get('/airports'),
};

// Itinerary APIs
export const itineraryAPI = {
  create: (userId, itineraryData) => api.post(`/itineraries?user_id=${userId}`, itineraryData),
  getUserItineraries: (userId) => api.get(`/itineraries/user/${userId}`),
  getItinerary: (itineraryId) => api.get(`/itineraries/${itineraryId}`),
  update: (itineraryId, data) => api.put(`/itineraries/${itineraryId}`, data),
  updateStatus: (itineraryId, status) => api.put(`/itineraries/${itineraryId}/status?status=${status}`),
  pay: (itineraryId) => api.put(`/itineraries/${itineraryId}/status?status=confirmed`),
  delete: (itineraryId) => api.delete(`/itineraries/${itineraryId}`),
  addFlight: (itineraryId, flightData) => api.post(`/itineraries/${itineraryId}/flights`, flightData),
  addHotel: (itineraryId, hotelData) => api.post(`/itineraries/${itineraryId}/hotels`, hotelData),
  addActivity: (itineraryId, activityData) => api.post(`/itineraries/${itineraryId}/activities`, activityData),
  removeFlight: (itineraryId, flightId) => api.delete(`/itineraries/${itineraryId}/flights/${flightId}`),
  removeHotel: (itineraryId, hotelId) => api.delete(`/itineraries/${itineraryId}/hotels/${hotelId}`),
  removeActivity: (itineraryId, activityId) => api.delete(`/itineraries/${itineraryId}/activities/${activityId}`),
  downloadPdf: (itineraryId) => api.get(`/itineraries/${itineraryId}/export/pdf`, { responseType: 'blob' }),
};

export default api;
