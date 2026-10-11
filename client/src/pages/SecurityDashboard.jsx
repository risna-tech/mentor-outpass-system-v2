import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, CheckCircle, XCircle, LogOut } from 'lucide-react';

export default function SecurityDashboard() {
  const navigate = useNavigate();
  const [passId, setPassId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!passId.trim()) return;

    // Temporary mock logic for tonight: Any ID longer than 4 characters is "Valid"
    if (passId.length > 4) {
      setVerificationResult({
        status: 'APPROVED',
        studentName: 'John Doe',
        room: 'B-204',
        validUntil: 'Today, 9:30 PM'
      });
    } else {
      setVerificationResult({
        status: 'INVALID'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 rounded-xl shadow-sm mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <ShieldCheck className="w-8 h-8 text-teal-400 mr-3" />
            <h1 className="text-2xl font-bold text-white">Gate Security</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Verify Outpass</h2>
          <form onSubmit={handleVerify} className="flex gap-3">
            <input 
              type="text" 
              placeholder="Enter Outpass ID..." 
              className="flex-1 p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:border-slate-900 uppercase"
              value={passId}
              onChange={(e) => {
                setPassId(e.target.value);
                setVerificationResult(null); // Clear result when typing
              }}
            />
            <button 
              type="submit" 
              className="px-6 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center font-bold"
            >
              <Search className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Verify</span>
            </button>
          </form>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`p-6 rounded-xl border animate-fade-in ${
            verificationResult.status === 'APPROVED' 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center mb-4">
              {verificationResult.status === 'APPROVED' ? (
                <CheckCircle className="w-10 h-10 text-emerald-600 mr-3" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600 mr-3" />
              )}
              <h2 className={`text-2xl font-bold ${
                verificationResult.status === 'APPROVED' ? 'text-emerald-800' : 'text-red-800'
              }`}>
                {verificationResult.status === 'APPROVED' ? 'PASS APPROVED' : 'INVALID PASS'}
              </h2>
            </div>
            
            {verificationResult.status === 'APPROVED' && (
              <div className="bg-white p-4 rounded-lg border border-emerald-100 space-y-2">
                <p className="text-gray-600"><strong className="text-gray-900">Student:</strong> {verificationResult.studentName}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Room:</strong> {verificationResult.room}</p>
                <p className="text-gray-600"><strong className="text-gray-900">Return By:</strong> {verificationResult.validUntil}</p>
              </div>
            )}
            {verificationResult.status === 'INVALID' && (
              <p className="text-red-600 font-medium">This pass ID does not exist, has expired, or was rejected by the warden. Do not allow exit.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}