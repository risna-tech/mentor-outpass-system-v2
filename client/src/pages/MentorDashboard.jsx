import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Megaphone, LogOut } from 'lucide-react';

export default function MentorDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#1a237e] p-8 rounded-xl shadow-sm mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mentor Dashboard</h1>
            <p className="text-teal-200">Welcome back. Review your assigned students' outpass requests.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Outpass Approvals Card */}
          <div 
            onClick={() => navigate('/dashboard/warden/approvals')} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-500 cursor-pointer transition-all"
          >
            <div className="bg-teal-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <ClipboardCheck className="w-7 h-7 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Student Approvals</h2>
            <p className="text-gray-500 text-sm">Review, approve, or reject pending outpass requests for your students.</p>
          </div>

          {/* Notice Board Card */}
          <div 
            onClick={() => navigate('/dashboard/notices')} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-500 cursor-pointer transition-all"
          >
            <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Megaphone className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Notice Board</h2>
            <p className="text-gray-500 text-sm">View or post official announcements for the students.</p>
          </div>
        </div>
      </div>
    </div>
  );
}