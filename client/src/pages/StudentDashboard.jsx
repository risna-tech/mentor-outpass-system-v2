import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FilePlus, Clock, LogOut, User, CheckCircle, AlertTriangle, Loader2, MapPin, QrCode, AlertCircle, Download } from 'lucide-react';
import { LogOut } from 'lucide-react'; // Add this to your existing lucide-react import
import { LogOut, Copy } from 'lucide-react'; // Add Copy here (along with whatever else you have)

export default function StudentDashboard() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [activeTab, setActiveTab] = useState('history'); 
  const [outpasses, setOutpasses] = useState([]);
  
  // Added parentType to state
  const [formData, setFormData] = useState({ 
    leaveCategory: 'SHORT_LEAVE',
    destination: '', 
    reason: '', 
    departureDate: '', 
    departureTime: '',
    returnDate: '',
    returnTime: '',
    parentType: 'Father', // New field
    parentPhone: '' 
  });
  
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
      const response = await axios.get('https://mentor-outpass-system-v2.onrender.com/api/outpasses/me', {
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
      
      // 1. Send data to your backend
      const response = await axios.post('https://mentor-outpass-system-v2.onrender.com/api/outpasses', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. If successful, generate the WhatsApp Link
      if (response.status === 201) {
        const outpassId = response.data.outpass.id;
        const parentPhone = formData.parentPhone; 
        
        // Create the secure approval link for the parent
        const approvalLink = `https://mentor-outpass-system-v2.vercel.app/approve/${outpassId}`;
        
        // Format the WhatsApp message (%0A creates a line break)
        const waMessage = `*MENTOR HOSTEL SYSTEM*%0A%0AHello,%0AI have requested a hostel outpass.%0A%0A*Destination:* ${formData.destination}%0A*Reason:* ${formData.reason}%0A%0A*Please review and Approve/Reject my request here:*%0A${approvalLink}`;
        
        // Clean the phone number (remove any non-numbers, ensure country code)
        let cleanPhone = parentPhone.replace(/\D/g, ''); 
        if (!cleanPhone.startsWith('91')) cleanPhone = `91${cleanPhone}`;
        
        // Open WhatsApp in a new tab instantly!
        window.open(`https://wa.me/${cleanPhone}?text=${waMessage}`, '_blank');
        
        setStatus({ type: 'success', message: 'Application submitted! Redirecting to WhatsApp...' });
        
        // Clear the form
        setFormData({ 
          leaveCategory: 'SHORT_LEAVE', destination: '', reason: '', 
          departureDate: '', departureTime: '', returnDate: '', returnTime: '', parentType: 'Father', parentPhone: '' 
        });
        setTimeout(() => setActiveTab('history'), 3000);
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to submit.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = outpasses.filter(p => p.status === 'PENDING').length;
  const approvedCount = outpasses.filter(p => p.status === 'APPROVED').length;
  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/login');
 };

 const handleCopyLink = (passId) => {
    // Generates the exact URL for the parent approval page
    const approvalLink = `${window.location.origin}/approve/${passId}`;
    navigator.clipboard.writeText(approvalLink);
    alert("Approval link copied to clipboard! You can now paste it to your parent.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          
          <button onClick={() => navigate('/dashboard/grievances')} className="w-full flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 text-gray-300">
            <AlertCircle className="w-5 h-5 mr-3 text-orange-500" /> Report Grievance
          </button>

          <button 
            onClick={() => navigate('/dashboard/notices')}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition-colors ml-4"
          >
           <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors ml-4 border border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button> 
            Notice Board
          </button>
          <button 
  onClick={() => handleCopyLink(pass.id)}
  className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-300 ml-2"
>
  <Copy className="w-4 h-4 mr-1" /> Copy Link
</button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

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
            <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
              <div className="bg-navy p-6">
                <h2 className="text-lg font-bold text-ivory flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-teal-300" /> Out-Pass Application
                </h2>
              </div>
              <div className="p-8">
                {status.message && (
                  <div className={`mb-6 p-4 rounded-lg flex items-start text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 shrink-0" /> : <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />}
                    <span>{status.message}</span>
                  </div>
                )}
                
                <form onSubmit={handleApply} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Leave Category</label>
                    <select 
                      required 
                      value={formData.leaveCategory} 
                      onChange={(e) => setFormData({...formData, leaveCategory: e.target.value})} 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none"
                    >
                      <option value="SAME_DAY">Same Day Leave (Return before curfew)</option>
                      <option value="SHORT_LEAVE">Short Leave (1-3 Days)</option>
                      <option value="LONG_LEAVE">Long Leave (Vacation/Holidays)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Destination</label>
                    <input type="text" required value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none" placeholder="e.g., Hometown, Hospital" />
                  </div>

                  {/* NEW: Father/Mother Selection & Number Input */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Approving Parent</label>
                      <select 
                        required
                        value={formData.parentType} 
                        onChange={(e) => setFormData({...formData, parentType: e.target.value})} 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">{formData.parentType}'s WhatsApp No.</label>
                      <input type="tel" required value={formData.parentPhone} onChange={(e) => setFormData({...formData, parentPhone: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none" placeholder="e.g., +918095446482" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Reason for leave</label>
                    <textarea required rows="2" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none" placeholder="Provide a valid reason..."></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-navy text-sm border-b pb-2">Departure Details</h4>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                        <input type="date" required value={formData.departureDate} onChange={(e) => setFormData({...formData, departureDate: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Exact Time</label>
                        <input type="time" required value={formData.departureTime} onChange={(e) => setFormData({...formData, departureTime: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none text-sm" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-navy text-sm border-b pb-2">Return Details</h4>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                        <input type="date" required value={formData.returnDate} onChange={(e) => setFormData({...formData, returnDate: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Exact Time</label>
                        <input type="time" required value={formData.returnTime} onChange={(e) => setFormData({...formData, returnTime: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal outline-none text-sm" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full bg-navy hover:bg-gray-800 text-white font-medium py-3 rounded-lg mt-4 flex justify-center items-center transition-colors shadow-sm">
                    {isSubmitting ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Submitting Request...</> : 'Submit Application'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
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
                      <th className="px-6 py-4 font-medium">Dates & Times</th>
                      <th className="px-6 py-4 font-medium text-center">Status</th>
                      <th className="px-6 py-4 font-medium text-center">Gate Pass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {outpasses.map((pass) => (
                      <tr key={pass.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-navy">{pass.destination}</p>
                          <p className="text-xs font-medium text-teal-600 mt-0.5">{pass.leaveCategory?.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pass.reason}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="font-medium text-gray-800">Departs: {new Date(pass.departureDate).toLocaleDateString()} {pass.departureTime && `at ${pass.departureTime}`}</div>
                          <div className="text-gray-500 mt-1">Returns: {new Date(pass.returnDate).toLocaleDateString()} {pass.returnTime && `at ${pass.returnTime}`}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              pass.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 
                              pass.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              {pass.status}
                            </span>
                          </div>
                          {pass.status === 'PENDING' && (
                              <p className="text-[10px] text-gray-400 mt-2">Awaiting Parent/Warden</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {pass.status === 'APPROVED' ? (
                            <div className="flex justify-center items-center flex-col space-y-2">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VERIFY_PASS_${pass.id}`} 
                                alt="QR Code" 
                                className="w-12 h-12 rounded-sm shadow-sm border border-gray-200"
                              />
                              <button className="flex items-center text-[11px] font-bold text-white bg-teal hover:bg-navy px-2 py-1.5 rounded transition-colors">
                                <Download className="w-3 h-3 mr-1" /> PDF Pass
                              </button>
                            </div>
                          ) : pass.status === 'REJECTED' ? (
                            <span className="text-gray-400 text-xs">N/A</span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Locked</span>
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