/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, } from 'react';
import { Phone, X, Eye, EyeOff, Mail, Lock, User, UserCheck } from 'lucide-react';
import { 
  signIn, 
  signUp, 
  signUpAnonymous, 
  signInWithGoogle,
} from '../lib/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup' | 'anonymous' | 'forgot';
  onSwitchMode: (mode: 'login' | 'signup' | 'anonymous' | 'forgot') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    agreedToTerms: false
  });
  const [errors, setErrors] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    agreedToTerms: ''
  });


  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {
      email: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      agreedToTerms: ''
    };
    let isValid = true;

    if (mode === 'login' || mode === 'forgot') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
        isValid = false;
      } 
    }

    if (mode === 'anonymous') {
      if (!formData.username) {
        newErrors.username = 'Username is required';
        isValid = false;
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
        isValid = false;
      }
    }

    if (mode === 'signup') {
      if (!formData.email) {
        newErrors.email = 'E-mail is required';
        isValid = false;
      }
      if (!formData.displayName) {
        newErrors.displayName = 'Full name is required';
        isValid = false;
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone Number is required';
        isValid = false;
      }
    }

    if (mode !== 'forgot') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
        isValid = false;
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
        isValid = false;
      }
    }

    if (mode === 'signup' || mode === 'anonymous') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    // Terms agreement validation for signup and anonymous
    if ((mode === 'signup' || mode === 'anonymous') && !formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const getRoleRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'therapist': return '/therapist/schedule';
      case 'client': return '/client/home';
      default: return '/client/home';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'forgot') {
      await handleForgotPassword();
      return;
    }
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let user;
      
      if (mode === 'login') {
        user = await signIn({
          email: formData.email,
          password: formData.password
        });
      } else if (mode === 'signup') {
        user = await signUp({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          phone: formData.phone
        });
      } else if (mode === 'anonymous') {
        user = await signUpAnonymous({
          username: formData.username,
          password: formData.password
        });
      }

      if (user) {
        console.log('User signed up:', user); 
        toast.success('Welcome to Kalm!');
        onClose();
        const redirectPath = getRoleRedirectPath(user.role || 'client');
        console.log('Redirecting to:', redirectPath); 
        navigate(redirectPath, { replace: true });
      } else {
        console.error('No user returned from signUp'); // Debug log
        toast.error('Failed to create account. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error.code, error.message); // Debug log
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      toast.success('Password reset email sent. Please check your inbox.');
      onSwitchMode('login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const user = await signInWithGoogle();
      toast.success('Welcome to Kalm!');
      onClose();
      const redirectPath = getRoleRedirectPath(user.role);
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;

    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData({
        ...formData,
        [name]: numericValue
      });
      setErrors({
        ...errors,
        [name]: ''
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      agreedToTerms: false
    });
    setErrors({
      email: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      agreedToTerms: ''
    });
  };

  const handleModeSwitch = (newMode: 'login' | 'signup' | 'anonymous' | 'forgot') => {
    resetForm();
    onSwitchMode(newMode);
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'login': return 'Log In to Your Account';
      case 'signup': return 'Create Your Kalm Account';
      case 'anonymous': return 'Join Anonymously';
      case 'forgot': return 'Reset Your Password';
      default: return 'Join Kalm';
    }
  };

  const getModalSubtitle = () => {
    switch (mode) {
      case 'login': return 'Please enter your credentials to access your account';
      case 'signup': return 'Start your mental wellness journey with Kalm';
      case 'anonymous': return 'Start privately without sharing personal details';
      case 'forgot': return 'Enter your email to receive a password reset link';
      default: return 'Start your mental wellness journey today';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-cream-100">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">
              {getModalTitle()}
            </h2>
            <p className="text-neutral-600 mt-1">
              {getModalSubtitle()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {mode === 'anonymous' && (
          <div className="p-6 border-b border-cream-100">
            <div className="bg-accent-green/10 border border-accent-green/20 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <UserCheck className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-accent-green text-sm mb-1">Privacy-First Account</h4>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li>• No email or personal information required</li>
                    <li>• Your data is stored securely under your username</li>
                    <li>• You can upgrade to a full account anytime</li>
                    <li>• Password recovery is not available for anonymous accounts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-500' : 'border-cream-200'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          )}

          {mode === 'anonymous' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.username ? 'border-red-500' : 'border-cream-200'
                  }`}
                  placeholder="Choose a unique username"
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      errors.displayName ? 'border-red-500' : 'border-cream-200'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.displayName && (
                  <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      errors.phone ? 'border-red-500' : 'border-cream-200'
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </>
          )}

          {mode !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-500' : 'border-cream-200'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              {mode === 'anonymous' && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Remember your password! Anonymous accounts cannot recover forgotten passwords.
                </p>
              )}
            </div>
          )}

          {(mode === 'signup' || mode === 'anonymous') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-cream-200'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-cream-200 text-primary-500 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-neutral-600">Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => handleModeSwitch('forgot')}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Forgot password?
              </button>
            </div>
          )}

          {(mode === 'signup' || mode === 'anonymous') && (
            <div className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleInputChange}
                className="mt-1 rounded border-cream-200 text-primary-500 focus:ring-primary-500" 
                required
              />
              <p className="text-sm text-neutral-600">
                I agree to the{' '}
                <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-500 hover:text-primary-600">Privacy Policy</a>
              </p>
              {errors.agreedToTerms && (
                <p className="text-red-500 text-xs mt-1">{errors.agreedToTerms}</p>
              )}
            </div>
          )}

          {mode === 'anonymous' && (
            <div className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleInputChange}
                className="mt-1 rounded border-cream-200 text-primary-500 focus:ring-primary-500" 
                required
              />
              <p className="text-sm text-neutral-600">
                I agree to the{' '}
                <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
                {' '}and understand that anonymous accounts have limited recovery options
              </p>
              {errors.agreedToTerms && (
                <p className="text-red-500 text-xs mt-1">{errors.agreedToTerms}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-2xl font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'anonymous' 
                ? 'bg-accent-green text-white hover:bg-accent-green/90'
                : mode === 'forgot'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {isSubmitting ? 'Please wait...' : 
             mode === 'login' ? 'Sign In' : 
             mode === 'signup' ? 'Create Account' :
             mode === 'forgot' ? 'Send Reset Link' :
             'Create Anonymous Account'}
          </button>

          {(mode === 'login' || mode === 'signup') && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cream-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-3 py-3 border border-cream-200 rounded-2xl hover:bg-cream-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-neutral-700">Google</span>
              </button>
            </>
          )}
        </form>

        <div className="p-6 border-t border-cream-100 text-center">
          <div className="space-y-2">
            {mode === 'forgot' ? (
              <p className="text-neutral-600">
                Remember your password?{' '}
                <button
                  onClick={() => handleModeSwitch('login')}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Sign in
                </button>
              </p>
            ) : mode === 'login' ? (
              <>
                <p className="text-neutral-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => handleModeSwitch('signup')}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Sign up
                  </button>
                </p>
                <p className="text-neutral-600">
                  Prefer complete privacy?{' '}
                  <button
                    onClick={() => handleModeSwitch('anonymous')}
                    className="text-primary-500 hover:text-accent-green/80 font-medium"
                  >
                    Join anonymously
                  </button>
                </p>
              </>
            ) : mode === 'signup' ? (
              <>
                <p className="text-neutral-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => handleModeSwitch('login')}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Sign in
                  </button>
                </p>
                <p className="text-neutral-600">
                  Want complete privacy?{' '}
                  <button
                    onClick={() => handleModeSwitch('anonymous')}
                    className="text-accent-green hover:text-accent-green/80 font-medium"
                  >
                    Join anonymously
                  </button>
                </p>
              </>
            ) : (
              <p className="text-neutral-600">
                Want full features?{' '}
                <button
                  onClick={() => handleModeSwitch('signup')}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Create regular account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;