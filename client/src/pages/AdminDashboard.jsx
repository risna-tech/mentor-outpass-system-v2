import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, FileText, Settings, LogOut, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the students from the backend when the page loads
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(' https://mentor-outpass-system-v2.onrender.com/api/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-navy text-ivory flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold tracking-wider">ADMIN PORTAL</h2>
          <p className="text-teal-300 text-xs mt-1">Hostel Management</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => navigate('/dashboard/admin/students')} 
            className="w-full flex items-center px-4 py-3 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5 mr-3" />
            Bulk Import
          </button>
          <button className="w-full flex items-center px-4 py-3 bg-teal text-white rounded-lg transition-colors">
            <FileText className="w-5 h-5 mr-3" />
            Student Roster
          </button>
          <button 
            onClick={() => navigate('/dashboard/admin/approvals')} 
            className="w-full flex items-center px-4 py-3 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5 mr-3" />
            Pass Approvals
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-navy">Student Management</h1>
          <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 mr-2 text-teal" />
            {user?.email}
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto bg-ivory">
          {/* Dynamic Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-teal">
              <p className="text-sm font-medium text-gray-500">Total Active Students</p>
              <h3 className="text-3xl font-bold text-navy mt-1">
                {isLoading ? '-' : students.length}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-navy">
              <p className="text-sm font-medium text-gray-500">Total Staff Accounts</p>
              <h3 className="text-3xl font-bold text-navy mt-1">1</h3>
            </div>
          </div>
          
          {/* Live Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-medium text-navy">Registered Students</h3>
            </div>
            
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center p-12 text-teal">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No students found. Use the Bulk Import tool to add some!
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-navy text-ivory text-sm uppercase tracking-wide">
                      <th className="px-6 py-4 font-medium">Student Email</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          {student.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}