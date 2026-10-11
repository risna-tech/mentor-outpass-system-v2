import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, MessageSquareWarning } from 'lucide-react';
import { ClipboardCheck, MessageSquareWarning, Megaphone } from 'lucide-react';

export default function WardenDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#1a237e] p-8 rounded-xl shadow-sm mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Warden Dashboard</h1>
          <p className="text-teal-200">Welcome back. Select a module to manage hostel operations.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Outpass Approvals Card */}
          <div 
            onClick={() => navigate('/dashboard/warden/approvals')} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-500 cursor-pointer transition-all"
          >
            <div className="bg-teal-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <ClipboardCheck className="w-7 h-7 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Outpass Approvals</h2>
            <p className="text-gray-500 text-sm">Review, approve, or reject pending student outpass requests forwarded by parents.</p>
          </div>

          {/* Grievance Board Card */}
          <div 
            onClick={() => navigate('/dashboard/grievances')} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-500 cursor-pointer transition-all"
          >
            <div className="bg-orange-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <MessageSquareWarning className="w-7 h-7 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Grievance Board</h2>
            <p className="text-gray-500 text-sm">View, track, and resolve complaints or feedback submitted by students.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
          {/* Outpass Approvals Card */}
          <div 
            onClick={() => navigate('/dashboard/warden/approvals')} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-500 cursor-pointer transition-all"
          >
            <div className="bg-teal-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <ClipboardCheck className="w-7 h-7 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Outpass Approvals</h2>
            <p className="text-gray-500 text-sm">Review, approve, or reject pending student outpass requests.</p>
          </div>

          {/* Grievance Board Card */}
          <div 
            onClick={() => navigate('/dashboard/grievances')} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-500 cursor-pointer transition-all"
          >
            <div className="bg-orange-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <MessageSquareWarning className="w-7 h-7 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Grievance Board</h2>
            <p className="text-gray-500 text-sm">View, track, and resolve complaints submitted by students.</p>
          </div>

          {/* NEW: Notice Board Card */}
          <div 
            onClick={() => navigate('/dashboard/notices')} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-500 cursor-pointer transition-all"
          >
            <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Megaphone className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Notice Board</h2>
            <p className="text-gray-500 text-sm">Post official announcements and updates for all students.</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}