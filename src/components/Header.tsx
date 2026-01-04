import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, User, LogOut, Instagram, Mail, Facebook, Youtube } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
    } catch {
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const goToDashboard = () => {
    if (!user) return;
    const roleMap: Record<string, string> = {
      admin: '/admin/dashboard',
      superadmin: '/admin/dashboard',
      therapist: '/therapist/schedule',
      client: '/client/home',
    };
    navigate(roleMap[user.role] || '/client/home');
  };

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Therapists', href: '#therapists' },
    { label: 'FAQ', href: '#faq' },
  ];

  const phoneNumber = '+94 (76) 633 0360';
  const phoneNumberForCall = '+94766330360';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-fixes-bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 lg:py-5">

          {/* LOGO */}
          <button
            onClick={() => {
              location.pathname === '/'
                ? window.scrollTo({ top: 0, behavior: 'smooth' })
                : navigate('/');
              setIsMenuOpen(false);
            }}
            className="flex items-center space-x-3 flex-shrink-0"
          >
            <img src="logo.jpg" alt="Kalm Logo" className="w-10 h-10 lg:w-8 lg:h-8" />
            <span className="text-lg lg:text-xl font-body font-medium text-black">
              Kalm.lk
            </span>
          </button>

          {/* ================= DESKTOP NAV (UNCHANGED) ================= */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-10">
              {navItems.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  className="font-body font-light uppercase text-sm hover:text-black hover:font-medium transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* ================= DESKTOP AUTH (UNCHANGED & RESTORED) ================= */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            {!user ? (
              <>
                <div className="flex items-center space-x-2 font-medium text-sm px-4 py-2 rounded-lg text-black">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">{phoneNumber}</span>
                </div>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="bg-fixes-bg-white border uppercase text-black px-5 py-2 rounded-full transition-colors duration-200 font-medium text-sm
                             border-black hover:bg-black hover:text-fixes-bg-white"
                >
                  Login
                </button>
              </>
            ) : (
              <button onClick={goToDashboard}>Dashboard</button>
            )}
          </div>

          {/* ================= MOBILE RIGHT AREA (ONLY FIXED PART) ================= */}
          <div className="flex items-center gap-1.5 lg:hidden">

            {!user ? (
              <>
                {/* Call */}
                <a href={`tel:${phoneNumberForCall}`}>
                  <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center">
                    <Phone className="w-4 h-4 text-black" />
                  </div>
                </a>

                {/* Login */}
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setIsMenuOpen(false);
                  }}
                  className="bg-white uppercase border border-black text-black px-3 py-1 rounded-full hover:bg-black hover:text-white transition-all duration-200 font-normal text-sm"
                >
                  Login
                </button>
              </>
            ) : (
              <div className="w-8 h-8 bg-fixes-accent-purple rounded-full flex items-center justify-center text-sm font-semibold text-white">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-black" />
              ) : (
                <Menu className="w-5 h-5 text-black" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
