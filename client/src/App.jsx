import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudents from './pages/ManageStudents';
import StudentDashboard from './pages/StudentDashboard';
import PassApprovals from './pages/PassApprovals';
import ProtectedRoute from './components/ProtectedRoute';
import GrievanceBoard from './pages/GrievanceBoard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route 
  path="/dashboard/grievances" 
  element={<ProtectedRoute allowedRoles={['STUDENT', 'WARDEN', 'ADMIN', 'MENTOR']}><GrievanceBoard /></ProtectedRoute>} 
/>
        
        {/* Public Login */}
        <Route path="/login" element={<Login />} />
        
        {/* ---------------- ADMIN ROUTES ---------------- */}
        <Route 
          path="/dashboard/admin" 
          element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} 
        />
        
        <Route 
          path="/dashboard/admin/students" 
          element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageStudents /></ProtectedRoute>} 
        />
        
        <Route 
          path="/dashboard/admin/approvals" 
          element={<ProtectedRoute allowedRoles={['ADMIN']}><PassApprovals /></ProtectedRoute>} 
        />

        {/* ---------------- WARDEN/MENTOR ROUTES ---------------- */}
        <Route 
          path="/dashboard/warden" 
          element={<ProtectedRoute allowedRoles={['WARDEN', 'MENTOR', 'ADMIN']}><PassApprovals /></ProtectedRoute>} 
        />

        {/* --------------- STUDENT ROUTES --------------- */}
        <Route 
          path="/dashboard/student" 
          element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} 
        />
      </Routes>
    </BrowserRouter>
  );
}