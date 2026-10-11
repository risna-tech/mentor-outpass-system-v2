import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudents from './pages/ManageStudents';
import StudentDashboard from './pages/StudentDashboard';
import PassApprovals from './pages/PassApprovals';
import ProtectedRoute from './components/ProtectedRoute';
import GrievanceBoard from './pages/GrievanceBoard';
import ParentApproval from './pages/ParentApproval'; // NEW IMPORT
import WardenDashboard from './pages/WardenDashboard';
import NoticeBoard from './pages/NoticeBoard';
import MentorDashboard from './pages/MentorDashboard';

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

        {/* PUBLIC PARENT APPROVAL ROUTE (No login required) */}
        <Route path="/approve/:id" element={<ParentApproval />} />
        
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
        {/* ---------------- MENTOR ROUTES ---------------- */}
        <Route 
          path="/dashboard/mentor" 
          element={<ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']}><MentorDashboard /></ProtectedRoute>} 
        />

{/* ---------------- WARDEN/MENTOR ROUTES ---------------- */}
<Route 
  path="/dashboard/warden" 
  element={<ProtectedRoute allowedRoles={['WARDEN', 'MENTOR', 'ADMIN']}><WardenDashboard /></ProtectedRoute>} 
/>
<Route 
  path="/dashboard/warden/approvals" 
  element={<ProtectedRoute allowedRoles={['WARDEN', 'MENTOR', 'ADMIN']}><PassApprovals /></ProtectedRoute>} 
/>

{/* --------------- STUDENT ROUTES --------------- */}
        <Route 
          path="/dashboard/student" 
          element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} 
        />

        {/* --------------- NOTICE BOARD ROUTE --------------- */}
        <Route 
          path="/dashboard/notices" 
          element={<ProtectedRoute allowedRoles={['STUDENT', 'WARDEN', 'ADMIN', 'MENTOR']}><NoticeBoard /></ProtectedRoute>} 
        />
      </Routes>
    </BrowserRouter>
  );
}