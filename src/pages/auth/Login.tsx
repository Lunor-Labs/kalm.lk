import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signIn, signInWithGoogle } from '../../lib/auth';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showRetryGoogle, setShowRetryGoogle] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setShowRetryGoogle(false); // Clear retry state when using email/password
    if (!identifier.trim()) {
      setError('Please enter your email or username');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
  try {
    const user = await signIn({ email: identifier, password });
    
    const userRole = user.role; 
    
    // Redirect based on role
    let redirectPath = '/client/home';
    if (userRole === 'admin' || userRole === 'superadmin') {
      redirectPath = '/admin/dashboard';
    } else if (userRole === 'therapist') {
      redirectPath = '/therapist/schedule';
    }
    
    const from = (location.state as any)?.from?.pathname || redirectPath;
    navigate(from, { replace: true });
  } catch (err: any) {
    setError(err.message || 'Failed to sign in');
  } finally {
    setLoading(false);
  }
};

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      // Redirect based on role
      let redirectPath = '/client/home';
      if (user.role === 'admin' || user.role === 'superadmin') {
        redirectPath = '/admin/dashboard';
      } else if (user.role === 'therapist') {
        redirectPath = '/therapist/schedule';
      }

      const from = (location.state as any)?.from?.pathname || redirectPath;
      navigate(from, { replace: true });
      setShowRetryGoogle(false); // Reset retry state on success
    } catch (err: any) {
      // Handle specific Firebase auth errors with user-friendly messages
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Click the button below to try again.');
        setShowRetryGoogle(true);
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.');
        setShowRetryGoogle(false);
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Another sign-in attempt is in progress. Please wait and try again.');
        setShowRetryGoogle(false);
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account with this email already exists. Please try signing in with email and password instead.');
        setShowRetryGoogle(false);
      } else {
        setError(err.message || 'Failed to sign in with Google');
        setShowRetryGoogle(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!identifier || !identifier.includes('@')) {
      setError('Enter your email address to reset your password');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, identifier);
      toast.success('Password reset email sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-start justify-center px-2 xs:px-4 sm:px-6 pt-6 sm:pt-10">
      <div className="w-full max-w-[90%] xs:max-w-[95%] sm:max-w-md bg-white rounded-2xl xs:rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-cream-100">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-fixes-accent-blue hover:text-fixes-accent-purple transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium text-fixes-accent-blue">Back to Home</span>
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Log In to Your Account</h1>
          <p className="text-neutral-600 mt-1 text-sm">Please enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="px-4 sm:px-6 pt-4 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (showRetryGoogle) setShowRetryGoogle(false); // Clear retry state when user types
                }}
                className="w-full pl-9 pr-4 py-3 border rounded-2xl  focus:ring-fixes-accent-blue focus:border-transparent transition-all duration-200 border-cream-200"
                placeholder="you@example.com or username"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (showRetryGoogle) setShowRetryGoogle(false); // Clear retry state when user types
                }}
                className="w-full pl-9 pr-11 py-3 border rounded-2xl  focus:ring-fixes-accent-blue focus:border-transparent transition-all duration-200 border-cream-200"
                placeholder="Your password"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="flex items-center">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-cream-200 text-fixes-accent-blue focus:ring-fixes-accent-blue" />
              <span className="ml-2 text-sm text-neutral-600">Remember me</span>
            </label>
            <button type="button" onClick={handleForgot} className="text-sm text-fixes-accent-blue hover:text-fixes-accent-purple">Forgot password?</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-fixes-accent-blue hover:bg-fixes-accent-purple text-white py-3 font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="px-4 sm:px-6 pb-6">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 border border-cream-200 rounded-2xl hover:bg-cream-50 transition-colors disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-neutral-700">Google</span>
          </button>

          {showRetryGoogle && (
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2 border border-red-200 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-sm font-medium">Try Google Again</span>
            </button>
          )}

          <div className="mt-6 text-sm text-neutral-600 text-center space-y-2">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="text-fixes-accent-blue hover:text-fixes-accent-purple font-medium">Sign up</Link>
            </p>
            <p>
              Prefer complete privacy?{' '}
              <Link to="/signup/anonymous" className="text-fixes-accent-blue hover:fixes-accent-blue/80 font-medium">Join anonymously</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


