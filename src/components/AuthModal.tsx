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
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', { ...formData, mode });
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email field for regular signup */}
          {mode === 'signup' && (
            <>
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
                    className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Username field for anonymous signup */}
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
                Use your email for regular accounts or username for anonymous accounts
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

          {mode === 'signup' && (
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

          {mode === 'anonymous' && (
            <div className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                className="mt-1 rounded border-cream-200 text-primary-500 focus:ring-primary-500" 
                required 
              />
              <p className="text-sm text-neutral-600">
                I agree to the{' '}
                <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
                {' '}and understand that anonymous accounts have limited recovery options
              </p>
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