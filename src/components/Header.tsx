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
      toast.error('Failed to sign out. Please refresh and try again.');
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

  const phoneNumberForCall = '+94766330360';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-fixes-bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">

          {/* Logo */}
          <button
            onClick={() => {
              location.pathname === '/'
                ? window.scrollTo({ top: 0, behavior: 'smooth' })
                : navigate('/');
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-2 shrink-0"
          >
            <img src="logo.jpg" alt="Kalm Logo" className="w-9 h-9" />
            <span className="text-lg font-medium text-black">Kalm.lk</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex flex-1 justify-center gap-10">
            {navItems.map(item => (
              <a
                key={item.label}
                href={item.href}
                className="uppercase text-sm hover:font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {!user ? (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="border px-5 py-2 rounded-full"
                >
                  Login
                </button>
              </>
            ) : (
              <button onClick={goToDashboard}>Dashboard</button>
            )}
          </div>

          {/* ================= MOBILE RIGHT SECTION ================= */}
          <div className="flex items-center gap-1.5 lg:hidden">

            {!user ? (
              <>
                {/* Call */}
                <a href={`tel:${phoneNumberForCall}`}>
                  <div className="w-7 h-7 border rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                </a>

                {/* Login */}
                <button
                  onClick={() => onOpenAuth('login')}
                  className="border px-3 py-1 rounded-full text-sm"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              </>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-md hover:bg-black/10"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-neutral-900 text-white rounded-b-xl px-4 py-4 space-y-3">
            {navItems.map(item => (
              <a
                key={item.label}
                href={item.href}
                className="block text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}

            {user && (
              <>
                <button onClick={goToDashboard} className="w-full bg-purple-600 py-2 rounded">
                  Dashboard
                </button>
                <button onClick={handleSignOut} className="w-full text-sm">
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showProfileMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
      )}
    </header>
  );
};

export default Header;
