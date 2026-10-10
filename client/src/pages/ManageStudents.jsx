import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function ManageStudents() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setStatus({ type: 'error', message: 'Please select a CSV file first.' });

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(' https://mentor-outpass-system-v2.onrender.com/api/students/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setStatus({ type: 'success', message: response.data.message });
      setFile(null); // Clear the file input after success
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to upload file. Check your connection.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate('/dashboard/admin')}
          className="flex items-center text-teal hover:text-navy transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-navy p-6">
            <h1 className="text-xl font-bold text-ivory">Bulk Import Students</h1>
            <p className="text-teal-200 text-sm mt-1">Upload a CSV file containing student email addresses.</p>
          </div>

          <div className="p-8">
            {/* Status Messages */}
            {status.message && (
              <div className={`mb-6 p-4 rounded-lg flex items-start text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 shrink-0" /> : <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Dropzone / Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors">
                <Upload className="w-10 h-10 text-teal mx-auto mb-4" />
                <label className="block text-sm font-medium text-navy mb-2 cursor-pointer">
                  <span className="bg-teal text-white px-4 py-2 rounded shadow-sm hover:bg-opacity-90 transition-colors">
                    Browse Files
                  </span>
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-3">
                  {file ? <span className="font-semibold text-navy">{file.name}</span> : 'Must be a valid .CSV file'}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-navy">
                <p className="font-semibold mb-1">CSV Format Requirements:</p>
                <p>Your file must have a header row with the exact word <strong>email</strong>. All successfully imported students will automatically be assigned the default password: <strong>Student123!</strong></p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !file}
                className="w-full flex justify-center items-center bg-navy hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> 
                    Processing...
                  </>
                ) : (
                  'Import Students'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}