import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, ShieldAlert, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(' https://mentor-outpass-system-v2.onrender.com/api/login', {
        email,
        password,
        role
      });
      if (response.data.token) {
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
// Inside your login function, after successful authentication:
    
    const userRole = role; // (or whatever variable holds the selected role)
    localStorage.setItem('role', userRole);

    // Route users to their specific dashboards
    if (userRole === 'STUDENT') {
      navigate('/dashboard/student');
    } else if (userRole === 'WARDEN') {
      navigate('/dashboard/warden');
    } else if (userRole === 'MENTOR') {
      navigate('/dashboard/mentor'); // NEW
    } else if (userRole === 'SECURITY') {
      navigate('/dashboard/security'); // NEW
    } else if (userRole === 'ADMIN') {
      navigate('/dashboard/admin');
    }
}

      // Save the secure token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Route to correct dashboard based on backend-verified role
      navigate(`/dashboard/${response.data.user.role.toLowerCase()}`);
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* Header Area */}
        <div className="bg-navy p-6 text-center">
          <h1 className="text-2xl font-bold text-ivory tracking-wide">
            HOSTEL OUT-PASS
          </h1>
          <p className="text-teal-200 text-sm mt-1">Management System</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-semibold text-navy mb-6 text-center">Secure Sign In</h2>

          {/* Error Message UI */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start text-sm">
              <ShieldAlert className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Select Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 text-navy rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none transition-colors"
              >
                <option value="STUDENT">Student</option>
                <option value="MENTOR">Mentor</option>
                <option value="WARDEN">Warden</option>
                <option value="SECURITY">Security Post</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 text-navy rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none transition-colors"
                  placeholder="Enter your registered email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 text-navy rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-teal hover:bg-[#066a75] text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}