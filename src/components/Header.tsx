import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      setShowProfileMenu(false);
      // Stay on landing page after logout
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const goToDashboard = () => {
    if (user) {
      const getRoleRedirectPath = (role: string): string => {
        switch (role) {
          case 'admin': return '/admin/dashboard';
          case 'therapist': return '/therapist/schedule';
          case 'client': return '/client/home';
          default: return '/client/home';
        }
      };
      navigate(getRoleRedirectPath(user.role));
    }
  };

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Therapists', href: '#therapists' },
    { label: 'FAQ', href: '#faq' },
  ];

  const phoneNumber = '+94 (76) 633 0360';
  const phoneNumberForCall = '+94766330360'; // Without spaces for tel: link

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-neutral-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <img 
              src="/kalm.lk/logo.jpg" 
              alt="Kalm Logo" 
              className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg"
            />
            <span className={`text-lg lg:text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-white' : 'text-white'
            }`}>
              kalm.lk
            </span>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-10">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`hover:text-primary-500 transition-colors duration-200 font-medium text-sm whitespace-nowrap ${
                    isScrolled ? 'text-neutral-300' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Desktop Auth/Profile Section */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            {!user ? (
              <>
                {/* Desktop - Show phone number */}
                <div className={`flex items-center space-x-2 font-medium text-sm px-4 py-2 rounded-lg ${
                  isScrolled 
                    ? 'text-primary-500' 
                    : 'text-white'
                }`}>
                  <Phone className="w-4 h-4" />
                  <span>{phoneNumber}</span>
                </div>
                <button
                  onClick={() => onOpenAuth('login')}
                  className={`transition-colors duration-200 font-medium text-sm px-5 py-2.5 rounded-full ${
                    isScrolled 
                      ? 'bg-primary-500 text-white hover:bg-primary-600' 
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  Login
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-black/30 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-neutral-300 text-xs capitalize">
                      {user.role} {user.isAnonymous && '(Anonymous)'}
                    </p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-sm border border-neutral-700 rounded-2xl shadow-xl">
                    <div className="p-4 border-b border-neutral-700">
                      <p className="text-white font-medium">{user.displayName || 'User'}</p>
                      <p className="text-neutral-300 text-sm">
                        {user.isAnonymous ? 'Anonymous Account' : user.email}
                      </p>
                      <p className="text-primary-500 text-xs capitalize mt-1">
                        {user.role}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={goToDashboard}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-white hover:bg-neutral-800 transition-colors duration-200"
                      >
                        <User className="w-4 h-4" />
                        <span>Go to Dashboard</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className={`w-5 h-5 ${isScrolled ? 'text-white' : 'text-white'}`} />
            ) : (
              <Menu className={`w-5 h-5 ${isScrolled ? 'text-white' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-neutral-900/95 backdrop-blur-md shadow-xl rounded-b-2xl border-t border-neutral-700">
            <div className="px-4 py-4 space-y-3">
              {/* Centered navigation items */}
              <div className="text-center space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-neutral-300 hover:text-primary-500 transition-colors duration-200 font-medium py-2 text-sm"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              
              {/* Centered action buttons */}
              <div className="pt-3 border-t border-neutral-700 space-y-2 text-center">
                {!user ? (
                  <>
                    {/* Mobile - Clickable call button */}
                    <a
                      href={`tel:${phoneNumberForCall}`}
                      className="inline-flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200 font-medium py-2 text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Us</span>
                    </a>
                    <div>
                      <button
                        onClick={() => {
                          onOpenAuth('login');
                          setIsMenuOpen(false);
                        }}
                        className="bg-primary-500 text-white px-6 py-2.5 rounded-full hover:bg-primary-600 transition-all duration-200 font-medium text-sm"
                      >
                        Login
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Mobile Profile Info */}
                    <div className="bg-black/30 rounded-2xl p-4 text-center">
                      <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-semibold">
                          {user.displayName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <p className="text-white font-medium">{user.displayName || 'User'}</p>
                      <p className="text-neutral-300 text-sm">
                        {user.isAnonymous ? 'Anonymous Account' : user.email}
                      </p>
                      <p className="text-primary-500 text-xs capitalize mt-1">
                        {user.role}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        goToDashboard();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-primary-500 text-white px-6 py-2.5 rounded-full hover:bg-primary-600 transition-all duration-200 font-medium text-sm"
                    >
                      Go to Dashboard
                    </button>
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-neutral-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;