import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(''); 
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // --- 1. ADD STATE ---
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage(''); // --- 2. CLEAR SUCCESS MESSAGE ON SUBMIT ---
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        // --- Added email validation ---
        if (!email.toLowerCase().endsWith('iitr.ac.in')) {
          setError('Sign up is only allowed with an iitr.ac.in email address.');
          setLoading(false);
          return;
        }
        // -----------------------------

        // Updated signUp call
        await signUp(email, password, fullName, phone);

        // --- 3. SET SUCCESS MESSAGE ---
        setSuccessMessage('Account created successfully! Please check your email to verify your account.');
        // Clear form and flip to login mode for a clean UI
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">CampusReads</h1>
          <p className="text-slate-600">Borrow and lend books with your peers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            {/* ... (Toggle buttons) ... */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* --- 4. RENDER SUCCESS MESSAGE --- */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}
            {/* ------------------------------- */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {!isLogin && (
              <>
                {/* ... (Full Name and Phone inputs) ... */}
              </>
            )}

            <div>
              {/* ... (Email input) ... */}
            </div>

            <div>
              {/* ... (Password input) ... */}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}