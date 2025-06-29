import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup' | 'anonymous';
  onSwitchMode: (mode: 'login' | 'signup' | 'anonymous') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: '',
  });

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {
      email: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: '',
    };
    let isValid = true;

    if (mode === 'signup') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!formData.email.includes('@')) {
        newErrors.email = "Email must include an '@' symbol";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
        isValid = false;
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
        isValid = false;
      } else if (!/^\+?\d{10,15}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number must contain only digits (10-15) and an optional +';
        isValid = false;
      }
    } else if (mode === 'login') {
      if (!formData.email) {
        newErrors.email = 'Email or username is required';
        isValid = false;
      } else if (formData.email.includes('@') && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email must include a valid '@' symbol";
        isValid = false;
      }
    } else if (mode === 'anonymous') {
      if (!formData.username) {
        newErrors.username = 'Username is required';
        isValid = false;
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if ((mode === 'signup' || mode === 'anonymous') && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if ((mode === 'signup' || mode === 'anonymous') && !formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', { ...formData, mode });
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    // Restrict phone input to digits and optional + in signup mode
    if (name === 'phone' && mode === 'signup') {
      newValue = value.replace(/[^+\d]/g, ''); // Allow only digits and +
      if (newValue.startsWith('+') && value.length > 1) {
        newValue = '+' + newValue.slice(1).replace(/\+/g, ''); // Allow only one + at start
      }
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : newValue,
    });
    setErrors({ ...errors, [name]: '' }); // Clear error on input change
  };

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    });
    setErrors({
      email: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: '',
    });
  };

  const handleModeSwitch = (newMode: 'login' | 'signup' | 'anonymous') => {
    resetForm();
    onSwitchMode(newMode);
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'anonymous': return 'Join Anonymously';
      default: return 'Join Kalm';
    }
  };

  const getModalSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to continue your wellness journey';
      case 'signup': return 'Create your account with full features';
      case 'anonymous': return 'Start privately without sharing personal details';
      default: return 'Start your mental wellness journey today';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
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

        {/* Anonymous Account Privacy Notice */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          {/* Email field for regular signup */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-5 h-5 text-neutral-400 z-10" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-2xl focus:border-neutral-400 transition-all duration-200"
                    placeholder="Enter your email"
                    aria-describedby="email-error"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 w-5 h-5 text-neutral-400 z-10" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-2xl focus:border-neutral-400 transition-all duration-200"
                    placeholder="Enter your phone number"
                    aria-describedby="phone-error"
                  />
                </div>
                {errors.phone && (
                  <p id="phone-error" className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </>
          )}

          {/* Username field for anonymous signup */}
          {mode === 'anonymous' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Username
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-5 h-5 text-neutral-400 z-10" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-2xl focus:border-neutral-400 transition-all duration-200"
                  placeholder="Choose a unique username"
                  aria-describedby="username-error"
                />
              </div>
              {errors.username && (
                <p id="username-error" className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                This will be your unique identifier. Choose something memorable!
              </p>
            </div>
          )}

          {/* Login field - accepts both email and username */}
          {mode === 'login' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email or Username
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-5 h-5 text-neutral-400 z-10" />
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-2xl focus:border-neutral-400 transition-all duration-200"
                  placeholder="Enter your email or username"
                  aria-describedby="email-error"
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                Use your email for regular accounts or username for anonymous accounts
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-5 h-5 text-neutral-400 z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border border-cream-200 rounded-2xl focus:border-neutral-400 transition-all duration-200"
                placeholder="Enter your password"
                aria-describedby="password-error"
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
              <p id="password-error" className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            {mode === 'anonymous' && (
              <p className="text-xs text-amber-600 mt-1 flex items-start space-x-1">
                <span>⚠️</span>
                <span>Important: Remember your password! Anonymous accounts cannot recover forgotten passwords.</span>
              </p>
            )}
          </div>

          {(mode === 'signup' || mode === 'anonymous') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-5 h-5 text-neutral-400 z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-2xl focus:border-neutral-400 transition-all duration-200"
                  placeholder="Confirm your password"
                  aria-describedby="confirmPassword-error"
                />
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="rounded border-cream-200 text-primary-500 focus:ring-0 focus:border-neutral-400"
                />
                <span className="ml-2 text-sm text-neutral-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary-500 hover:text-primary-600">
                Forgot password?
              </button>
            </div>
          )}

          {(mode === 'signup' || mode === 'anonymous') && (
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="mt-1 rounded border-cream-200 text-primary-500 focus:ring-0 focus:border-neutral-400"
                />
                <p className="text-sm text-neutral-600">
                  I agree to the{' '}
                  <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
                  {mode === 'anonymous' ? ' and understand that anonymous accounts have limited recovery options' : ' and '}
                  <a href="#" className="text-primary-500 hover:text-primary-600">Privacy Policy</a>
                </p>
              </label>
              {errors.agreeTerms && (
                <p id="agreeTerms-error" className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-2xl font-semibold transition-colors duration-200 ${
              mode === 'anonymous' 
                ? 'bg-accent-green text-white hover:bg-accent-green/90'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {mode === 'login' ? 'Sign In' : 
             mode === 'anonymous' ? 'Create Anonymous Account' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-cream-100 text-center">
          <div className="space-y-2">
            <p className="text-neutral-600">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <button
                onClick={() => handleModeSwitch(mode === 'login' ? 'signup' : 'login')}
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
            
            {mode !== 'anonymous' && (
              <p className="text-neutral-600">
                Want complete privacy?{' '}
                <button
                  onClick={() => handleModeSwitch('anonymous')}
                  className="text-accent-green hover:text-accent-green/80 font-medium"
                >
                  Join anonymously
                </button>
              </p>
            )}
            
            {mode === 'anonymous' && (
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