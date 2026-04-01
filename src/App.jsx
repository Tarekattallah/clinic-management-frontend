import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar          from './components/Navbar';
import ProtectedRoute  from './components/ProtectedRoute';

import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import HomePage            from './pages/HomePage';
import DoctorsPage         from './pages/DoctorsPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import AppointmentsPage    from './pages/AppointmentsPage';
import DoctorProfilePage   from './pages/DoctorProfilePage';
import AdminPage           from './pages/AdminPage';
import SpecialtiesPage     from './pages/SpecialtiesPage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={!user ? <LoginPage />    : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />

        {/* Guest + logged-in */}
        <Route path="/"        element={<ProtectedRoute allowGuest><HomePage /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute allowGuest><DoctorsPage /></ProtectedRoute>} />

        {/* Logged-in only */}
        <Route path="/appointments"   element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
        <Route path="/book"           element={<ProtectedRoute roles={['patient']}><BookAppointmentPage /></ProtectedRoute>} />
        <Route path="/doctor-profile" element={<ProtectedRoute roles={['doctor']}><DoctorProfilePage /></ProtectedRoute>} />
        <Route path="/admin"          element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
        <Route path="/admin/specialties" element={<ProtectedRoute roles={['admin']}><SpecialtiesPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
