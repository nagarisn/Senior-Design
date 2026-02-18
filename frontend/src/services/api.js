import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User APIs
export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getUser: (userId) => api.get(`/users/${userId}`),
  getPreferences: (userId) => api.get(`/users/${userId}/preferences`),
  updatePreferences: (userId, preferences) => api.put(`/users/${userId}/preferences`, preferences),
  getFavorites: (userId) => api.get(`/users/${userId}/favorites`),
  addFavorite: (userId, destination) => api.post(`/users/${userId}/favorites`, destination),
  removeFavorite: (userId, favoriteId) => api.delete(`/users/${userId}/favorites/${favoriteId}`),
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
  updateStatus: (itineraryId, status) => api.put(`/itineraries/${itineraryId}/status?status=${status}`),
  delete: (itineraryId) => api.delete(`/itineraries/${itineraryId}`),
  addFlight: (itineraryId, flightData) => api.post(`/itineraries/${itineraryId}/flights`, flightData),
  addHotel: (itineraryId, hotelData) => api.post(`/itineraries/${itineraryId}/hotels`, hotelData),
  addActivity: (itineraryId, activityData) => api.post(`/itineraries/${itineraryId}/activities`, activityData),
};

export default api;
