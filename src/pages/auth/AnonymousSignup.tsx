import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpAnonymous } from '../../lib/auth';
import { User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import LegalModal from '../../components/LegalModal';

const AnonymousSignup: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (!agree) {
        setError('You must agree to the terms');
        setLoading(false);
        return;
      }
      await signUpAnonymous({ username, password });
      navigate('/client/home', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create anonymous account');
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
              className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium text-primary-500">Back to Home</span>
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Join Anonymously</h1>
          <p className="text-neutral-600 mt-1 text-sm">Start privately without sharing personal details</p>
        </div>

        {error && (
          <div className="px-4 sm:px-6 pt-4 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 border-cream-200"
                placeholder="Choose a unique username"
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
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-11 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 border-cream-200"
                placeholder="Create a password"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 border-cream-200"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <label className="flex items-start space-x-3">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 rounded border-cream-200 text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-neutral-600">I understand password recovery is not available for anonymous accounts. I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-primary-500 hover:text-primary-600 underline">Terms</button> and <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-primary-500 hover:text-primary-600 underline">Privacy Policy</button>.</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-accent-green text-white hover:bg-accent-green/90 py-3 font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create anonymous account'}
          </button>
        </form>

        <div className="px-4 sm:px-6 pb-6 text-sm text-neutral-600 text-center space-y-2">
          <p>Want a regular account? <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-medium">Sign up with email</Link></p>
          <p>Already have an account? <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">Sign in</Link></p>
        </div>
      </div>

      {/* Legal Modals */}
      <LegalModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
        type="terms" 
      />
      <LegalModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
        type="privacy" 
      />
    </div>
  );
};

export default AnonymousSignup;


