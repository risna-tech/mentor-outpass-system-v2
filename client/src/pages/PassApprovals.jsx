import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check, X, Loader2, AlertCircle } from 'lucide-react';

export default function PassApprovals() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://mentor-outpass-system-v2.onrender.com/api/outpasses/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://mentor-outpass-system-v2.onrender.com/api/outpasses/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the list immediately after updating
      fetchApplications();
    } catch (error) {
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-ivory p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- NEW BUTTON LAYOUT --- */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-teal hover:text-navy transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>

          <button 
            onClick={() => navigate('/dashboard/grievances')}
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm font-medium transition-colors"
          >
            View Grievance Board
          </button>
        </div>
        {/* ------------------------- */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-navy p-6">
            <h1 className="text-xl font-bold text-ivory">Pending Approvals</h1>
            <p className="text-teal-200 text-sm mt-1">Review and manage student out-pass requests.</p>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center p-12 text-teal"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No applications found in the system.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-navy">
                    <th className="px-6 py-4">Student Email</th>
                    <th className="px-6 py-4">Destination & Reason</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800 text-sm">
                        {app.student?.email}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-navy text-sm">{app.destination}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{app.reason}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="whitespace-nowrap">{new Date(app.departureDate).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">to {new Date(app.returnDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {app.status === 'PENDING' ? (
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded shadow-sm transition-colors"
                              title="Approve Pass"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm transition-colors"
                              title="Reject Pass"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center text-gray-400">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}