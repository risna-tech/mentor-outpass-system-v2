import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Send, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

export default function GrievanceBoard() {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [category, setCategory] = useState('Maintenance');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Check who is logged in to change the UI
  const user = JSON.parse(localStorage.getItem('user'));
  const isStaff = user?.role === 'WARDEN' || user?.role === 'ADMIN' || user?.role === 'MENTOR';

  const fetchGrievances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://mentor-outpass-system-v2.onrender.com/api/grievances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrievances(response.data);
    } catch (error) {
      console.error("Failed to fetch grievances", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGrievances(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://mentor-outpass-system-v2.onrender.com/api/grievances', 
        { category, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('');
      fetchGrievances(); // Refresh the board instantly
      alert('Anonymous grievance submitted securely.');
    } catch (error) {
      alert("Failed to submit grievance.");
    }
  };

  const handleReply = async (id) => {
    if (!replyText[id]) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://mentor-outpass-system-v2.onrender.com/api/grievances/${id}/reply`, 
        { reply: replyText[id], status: 'RESOLVED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyText({ ...replyText, [id]: '' });
      fetchGrievances();
    } catch (error) {
      alert("Failed to post reply.");
    }
  };

  return (
    <div className="min-h-screen bg-ivory p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(isStaff ? '/dashboard/warden' : '/dashboard/student')}
          className="flex items-center text-teal hover:text-navy transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>

        {/* STUDENT SUBMISSION FORM (Hidden for Staff) */}
        {!isStaff && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-navy flex items-center mb-4">
              <AlertCircle className="w-5 h-5 mr-2 text-teal" />
              Submit Anonymous Grievance
            </h2>
            <p className="text-sm text-gray-500 mb-4">Your identity is completely hidden. Please be respectful and descriptive.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-teal"
                >
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Food">Mess & Food Quality</option>
                  <option value="Security">Security & Safety</option>
                  <option value="Other">Other / General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                  placeholder="Describe the issue..."
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-teal"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="flex items-center justify-center w-full md:w-auto px-6 py-2 bg-teal hover:bg-navy text-white rounded font-medium transition-colors"
              >
                <Send className="w-4 h-4 mr-2" /> Submit Anonymously
              </button>
            </form>
          </div>
        )}

        {/* PUBLIC GRIEVANCE BOARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-navy p-6">
            <h1 className="text-xl font-bold text-ivory flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" /> Public Grievance Board
            </h1>
          </div>

          <div className="p-6 space-y-6">
            {isLoading ? (
              <p className="text-center text-teal">Loading board...</p>
            ) : grievances.length === 0 ? (
              <p className="text-center text-gray-500">No issues reported yet.</p>
            ) : (
              grievances.map((g) => (
                <div key={g.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                      {g.category}
                    </span>
                    <span className={`flex items-center text-xs font-bold ${g.status === 'RESOLVED' ? 'text-green-600' : 'text-orange-500'}`}>
                      {g.status === 'RESOLVED' ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                      {g.status}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm mb-4">{g.message}</p>

                  {/* Official Reply Section */}
                  {g.reply ? (
                    <div className="bg-teal-50 border-l-4 border-teal p-3 rounded-r text-sm">
                      <strong className="text-navy block mb-1">Official Response:</strong>
                      <p className="text-gray-700">{g.reply}</p>
                    </div>
                  ) : isStaff ? (
                    <div className="mt-4 flex gap-2">
                      <input 
                        type="text"
                        placeholder="Type an official reply..."
                        value={replyText[g.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [g.id]: e.target.value })}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-teal"
                      />
                      <button 
                        onClick={() => handleReply(g.id)}
                        className="px-4 py-2 bg-navy text-white text-sm rounded hover:bg-teal transition-colors"
                      >
                        Reply & Resolve
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}