import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Check, X, Loader2, MapPin } from 'lucide-react';

export default function ParentApproval() {
  const { id } = useParams(); // Grabs the outpass ID directly from the WhatsApp link URL
  const [outpass, setOutpass] = useState(null);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOutpass = async () => {
      try {
        // Uses the PUBLIC route we made - no token required!
        const response = await axios.get(`https://mentor-outpass-system-v2.onrender.com/api/outpasses/public/${id}`);
        setOutpass(response.data);
        setStatus(response.data.parentStatus);
      } catch (err) {
        setError('Outpass not found or server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchOutpass();
  }, [id]);

  const handleAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} this outpass?`)) return;
    
    try {
      // Uses the PUBLIC status update route
      await axios.put(`https://mentor-outpass-system-v2.onrender.com/api/outpasses/public/${id}/status`, { status: action });
      setStatus(action);
    } catch (err) {
      alert('Error updating status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow border border-red-100 text-center text-red-500 font-medium">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full border border-gray-100 overflow-hidden">
        <div className="bg-[#1a237e] p-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wider">MENTOR HOSTEL</h1>
          <p className="text-teal-300 text-sm mt-1">Parental Approval Portal</p>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4 pb-2 border-b">
            <MapPin className="w-5 h-5 mr-2 text-teal-600" /> Outpass Request Details
          </h2>

          <div className="space-y-4 mb-8 text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p><span className="font-semibold text-gray-900">Student:</span> {outpass.student.email}</p>
            <p><span className="font-semibold text-gray-900">Destination:</span> {outpass.destination}</p>
            <p><span className="font-semibold text-gray-900">Reason:</span> {outpass.reason}</p>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <p><span className="font-semibold text-gray-900">Leaves:</span> {new Date(outpass.departureDate).toLocaleDateString()} at {outpass.departureTime}</p>
              <p><span className="font-semibold text-gray-900">Returns:</span> {new Date(outpass.returnDate).toLocaleDateString()} at {outpass.returnTime}</p>
            </div>
          </div>

          {status === 'PENDING' ? (
            <div className="flex gap-4">
              <button
                onClick={() => handleAction('APPROVED')}
                className="flex-1 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition shadow-sm"
              >
                <Check className="w-5 h-5 mr-2" /> APPROVE
              </button>
              <button
                onClick={() => handleAction('REJECTED')}
                className="flex-1 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition shadow-sm"
              >
                <X className="w-5 h-5 mr-2" /> REJECT
              </button>
            </div>
          ) : (
            <div className={`text-center p-4 rounded-lg font-bold border ${status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              You have {status} this outpass.
              {status === 'APPROVED' && <p className="text-sm font-normal mt-1">The request has been forwarded to the Warden.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}