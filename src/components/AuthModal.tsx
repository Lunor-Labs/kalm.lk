import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<'regular' | 'guest'>('regular');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', { ...formData, accountType });
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setAccountType('regular');
  };

  const handleModeSwitch = (newMode: 'login' | 'signup') => {
    resetForm();
    onSwitchMode(newMode);
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
              {mode === 'login' ? 'Welcome Back' : 'Join Kalm'}
            </h2>
            <p className="text-neutral-600 mt-1">
              {mode === 'login' 
                ? 'Sign in to continue your wellness journey' 
                : 'Start your mental wellness journey today'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Account Type Selection for Sign Up */}
        {mode === 'signup' && (
          <div className="p-6 border-b border-cream-100">
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Choose Account Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType('regular')}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  accountType === 'regular'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-cream-200 hover:border-cream-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-sm text-neutral-800">Regular Account</span>
                </div>
                <p className="text-xs text-neutral-600">Full features with email verification</p>
              </button>
              
              <button
                type="button"
                onClick={() => setAccountType('guest')}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  accountType === 'guest'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-cream-200 hover:border-cream-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <UserCheck className="w-4 h-4 text-accent-green" />
                  <span className="font-medium text-sm text-neutral-800">Guest Account</span>
                </div>
                <p className="text-xs text-neutral-600">Privacy-first, no email required</p>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Username field for guest signup only */}
          {mode === 'signup' && accountType === 'guest' && (
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
                  className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Choose a unique username"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                This will be your unique identifier. Choose something memorable!
              </p>
            </div>
          )}

          {/* Email field for regular signup */}
          {mode === 'signup' && accountType === 'regular' && (
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
                  className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
          )}

          {/* Login field - accepts both email and username */}
          {mode === 'login' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email or username"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Use your email for regular accounts or username for guest accounts
              </p>
            </div>
          )}

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
                className="w-full pl-10 pr-12 py-3 border border-cream-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {mode === 'signup' && accountType === 'guest' && (
              <p className="text-xs text-amber-600 mt-1 flex items-start space-x-1">
                <span>⚠️</span>
                <span>Important: Remember your password! Guest accounts cannot recover forgotten passwords.</span>
              </p>
            )}
          </div>

          {mode === 'signup' && (
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
                  className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          )}

          {/* Guest Account Privacy Notice */}
          {mode === 'signup' && accountType === 'guest' && (
            <div className="bg-accent-green/10 border border-accent-green/20 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <UserCheck className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-accent-green text-sm mb-1">Privacy-First Account</h4>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li>• No email or personal information required</li>
                    <li>• Your data is stored securely under your username</li>
                    <li>• You can upgrade to a full account anytime</li>
                    <li>• Password recovery is not available for guest accounts</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-cream-200 text-primary-500 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-neutral-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary-500 hover:text-primary-600">
                Forgot password?
              </button>
            </div>
          )}

          {mode === 'signup' && accountType === 'regular' && (
            <div className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                className="mt-1 rounded border-cream-200 text-primary-500 focus:ring-primary-500" 
                required 
              />
              <p className="text-sm text-neutral-600">
                I agree to the{' '}
                <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-500 hover:text-primary-600">Privacy Policy</a>
              </p>
            </div>
          )}

          {mode === 'signup' && accountType === 'guest' && (
            <div className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                className="mt-1 rounded border-cream-200 text-primary-500 focus:ring-primary-500" 
                required 
              />
              <p className="text-sm text-neutral-600">
                I agree to the{' '}
                <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
                {' '}and understand that guest accounts have limited recovery options
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary-500 text-white py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 font-semibold"
          >
            {mode === 'login' ? 'Sign In' : 
             accountType === 'guest' ? 'Create Guest Account' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-cream-100 text-center">
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
        </div>
      </div>
    </div>
  );
};

export default AuthModal;