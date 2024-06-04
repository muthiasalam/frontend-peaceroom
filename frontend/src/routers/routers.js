import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import { Beranda, Jadwal, Login, Peminjaman, Ruangan, Dashboard, Status, Akun } from "../pages";
import ProtectedRoute from '../protectedRoute'; // Import ProtectedRoute
import { AuthProvider } from '../authContext'; // Import AuthProvider

const Routers = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/peminjaman" element={<ProtectedRoute element={<Peminjaman />} />} />
          <Route path="/ruangan" element={<ProtectedRoute element={<Ruangan />} />} />
          <Route path="/akun" element={<ProtectedRoute element={<Akun />} />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default Routers;
