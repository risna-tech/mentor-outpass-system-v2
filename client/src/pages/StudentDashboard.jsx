import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FilePlus, Clock, LogOut, User, CheckCircle, AlertTriangle, Loader2, MapPin, QrCode } from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [activeTab, setActiveTab] = useState('history'); 
  const [outpasses, setOutpasses] = useState([]);
  
  const [formData, setFormData] = useState({ destination: '', reason: '', departureDate: '', returnDate: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(' https://mentor-outpass-system-v2.onrender.com/api/outpasses/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOutpasses(response.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.post(' https://mentor-outpass-system-v2.onrender.com/api/outpasses', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ type: 'success', message: 'Application submitted! Pending approval.' });
      setFormData({ destination: '', reason: '', departureDate: '', returnDate: '' });
      setTimeout(() => setActiveTab('history'), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to submit.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Calculate dynamic stats
  const pendingCount = outpasses.filter(p => p.status === 'PENDING').length;
  const approvedCount = outpasses.filter(p => p.status === 'APPROVED').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-navy text-ivory flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold tracking-wider">STUDENT PORTAL</h2>
          <p className="text-teal-300 text-xs mt-1">Hostel Out-Pass</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => setActiveTab('apply')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'apply' ? 'bg-teal text-white' : 'hover:bg-gray-800 text-gray-300'}`}>
            <FilePlus className="w-5 h-5 mr-3" /> New Application
          </button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-teal text-white' : 'hover:bg-gray-800 text-gray-300'}`}>
            <Clock className="w-5 h-5 mr-3" /> Pass History
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-navy">
            {activeTab === 'apply' ? 'Request Out-Pass' : 'My Dashboard'}
          </h1>
          <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            <User className="w-4 h-4 mr-2 text-teal" /> {user?.email}
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto bg-ivory">
          
          {/* Dynamic Stat Cards (Only show on History Tab) */}
          {activeTab === 'history' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-orange-500">
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <h3 className="text-3xl font-bold text-navy mt-1">{pendingCount}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
                <p className="text-sm font-medium text-gray-500">Approved Passes</p>
                <h3 className="text-3xl font-bold text-navy mt-1">{approvedCount}</h3>
              </div>
            </div>
          )}

          {activeTab === 'apply' ? (
            /* APPLICATION FORM */
            <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-navy p-6">
                <h2 className="text-lg font-bold text-ivory flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-teal-300" /> Destination Details
                </h2>
              </div>
              <div className="p-8">
                {status.message && (
                  <div className={`mb-6 p-4 rounded-lg flex items-start text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 shrink-0" /> : <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />}
                    <span>{status.message}</span>
                  </div>
                )}
                <form onSubmit={handleApply} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Where are you going?</label>
                    <input type="text" required value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none" placeholder="e.g., Hometown, Hospital" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Reason for leave</label>
                    <textarea required rows="3" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none" placeholder="Provide a valid reason..."></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Departure Date</label>
                      <input type="date" required value={formData.departureDate} onChange={(e) => setFormData({...formData, departureDate: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Return Date</label>
                      <input type="date" required value={formData.returnDate} onChange={(e) => setFormData({...formData, returnDate: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-navy hover:bg-gray-800 text-white font-medium py-3 rounded-lg mt-4 flex justify-center items-center">
                    {isSubmitting ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Submitting...</> : 'Submit Application'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* HISTORY TABLE WITH QR CODES */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-navy">My Applications</h3>
              </div>
              {isLoadingHistory ? (
                <div className="flex justify-center p-12 text-teal"><Loader2 className="w-8 h-8 animate-spin" /></div>
              ) : outpasses.length === 0 ? (
                <div className="p-12 text-center text-gray-500">You have no out-pass history.</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-navy text-ivory text-sm">
                      <th className="px-6 py-4 font-medium">Destination</th>
                      <th className="px-6 py-4 font-medium">Dates</th>
                      <th className="px-6 py-4 font-medium text-center">Status</th>
                      <th className="px-6 py-4 font-medium text-center">Gate Pass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {outpasses.map((pass) => (
                      <tr key={pass.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-navy">{pass.destination}</p>
                          <p className="text-xs text-gray-500 mt-1">{pass.reason}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="whitespace-nowrap">{new Date(pass.departureDate).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">to {new Date(pass.returnDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            pass.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                            pass.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {pass.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {pass.status === 'APPROVED' ? (
                            <div className="flex justify-center items-center flex-col">
                              {/* Dynamic QR Code Generated via API using the Pass ID */}
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VERIFY_PASS_${pass.id}`} 
                                alt="QR Code" 
                                className="w-16 h-16 rounded-md shadow-sm border border-gray-200"
                              />
                              <span className="text-[10px] text-gray-500 mt-1 flex items-center">
                                <QrCode className="w-3 h-3 mr-1" /> Ready to scan
                              </span>
                            </div>
                          ) : pass.status === 'REJECTED' ? (
                            <span className="text-gray-400 text-xs">N/A</span>
                          ) : (
                            <span className="text-gray-400 text-xs">Waiting...</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}