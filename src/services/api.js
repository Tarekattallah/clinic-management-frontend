import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

// Doctors
export const getDoctors              = ()     => api.get('/doctors');
export const getDoctorById           = (id)   => api.get(`/doctors/${id}`);
export const updateDoctorProfile     = (data) => api.put('/doctors/profile', data);
export const updateDoctorSpecialties = (data) => api.put('/doctors/profile/specialties', data);

// Appointments
export const createAppointment  = (data) => api.post('/appointments', data);
export const getAppointments    = ()     => api.get('/appointments');
export const updateAppointment  = (id, data) => api.put(`/appointments/${id}`, data);
export const cancelAppointment  = (id)   => api.patch(`/appointments/${id}/cancel`);

// Specialties
export const getSpecialties   = ()     => api.get('/specialties');
export const createSpecialty  = (data) => api.post('/specialties', data);
export const deleteSpecialty  = (id)   => api.delete(`/specialties/${id}`);

// Admin
export const getAllAppointments = ()   => api.get('/admin/appointments');
export const getAllUsers        = ()   => api.get('/admin/users');
export const deleteUser        = (id) => api.delete(`/admin/users/${id}`);

export default api;
