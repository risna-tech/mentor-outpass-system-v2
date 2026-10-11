import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';

export default function NoticeBoard() {
  const navigate = useNavigate();
  // Get the role from localStorage to determine permissions
  const userRole = localStorage.getItem('role') || 'STUDENT';
  const canManageNotices = ['ADMIN', 'WARDEN', 'MENTOR'].includes(userRole);

  // Temporary state for tonight (Tomorrow we connect this to the database)
  const [notices, setNotices] = useState([
    { id: 1, title: "Hostel Timing Update", content: "All students must return to the hostel by 9:30 PM this weekend.", date: "Oct 12, 2026", author: "Warden" },
    { id: 2, title: "Maintenance Work", content: "Water supply will be stopped on Block B from 10 AM to 2 PM on Tuesday.", date: "Oct 11, 2026", author: "Admin" }
  ]);
  
  const [isPosting, setIsPosting] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });

  const handlePost = (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    
    const notice = {
      id: Date.now(),
      title: newNotice.title,
      content: newNotice.content,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: userRole.charAt(0) + userRole.slice(1).toLowerCase()
    };
    
    setNotices([notice, ...notices]);
    setNewNotice({ title: '', content: '' });
    setIsPosting(false);
  };

  const handleDelete = (id) => {
    setNotices(notices.filter(notice => notice.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center text-teal-600 hover:text-navy mb-4 font-medium transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Megaphone className="w-8 h-8 mr-3 text-teal-600" /> Official Notice Board
            </h1>
          </div>

          {canManageNotices && !isPosting && (
            <button 
              onClick={() => setIsPosting(true)}
              className="flex items-center px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" /> Post Notice
            </button>
          )}
        </div>

        {/* Posting Form (Only visible to Staff when 'Post Notice' is clicked) */}
        {isPosting && (
          <form onSubmit={handlePost} className="bg-white p-6 rounded-xl shadow-sm border border-teal-100 mb-8 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Create New Notice</h2>
            <input 
              type="text" 
              placeholder="Notice Title" 
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-teal-500"
              value={newNotice.title}
              onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
            />
            <textarea 
              placeholder="Notice Details..." 
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-teal-500"
              value={newNotice.content}
              onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsPosting(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm">Publish</button>
            </div>
          </form>
        )}

        {/* Notice Feed */}
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-navy">{notice.title}</h3>
                
                {canManageNotices && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => handleDelete(notice.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">{notice.content}</p>
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                <span>Posted by {notice.author}</span>
                <span className="mx-2">•</span>
                <span>{notice.date}</span>
              </div>
            </div>
          ))}
          
          {notices.length === 0 && (
            <div className="text-center p-12 text-gray-400 bg-white rounded-xl border border-gray-100 border-dashed">
              No official notices at this time.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}