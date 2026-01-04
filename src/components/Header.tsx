import React, { useState } from 'react';
import { Menu, X, Phone, Instagram, Mail, Facebook, Youtube } from 'lucide-react';
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

  const handleSignOut = async () => {
    try {
      await signOut();
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - headerHeight,
          behavior: 'smooth',
        });
        window.history.pushState(null, '', href);
        setIsMenuOpen(false);
      } else {
        console.warn(`Element with ID "${id}" not found`);
      }
    } else {
      navigate(href);
      setIsMenuOpen(false);
    }
  };

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

          {/* ================= DESKTOP NAV (FIXED - Added click handler) ================= */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-10">
              {navItems.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="font-body font-light uppercase text-sm hover:text-black hover:font-medium transition-colors duration-200 cursor-pointer"
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
              <div className="flex items-center space-x-3">
                <button
                  onClick={goToDashboard}
                  className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="w-6 h-6 bg-fixes-accent-purple rounded-full flex items-center justify-center text-xs font-semibold">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium">{user.displayName || 'User'}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-black hover:text-gray-600 transition-colors duration-200 text-sm"
                >
                  Sign Out
                </button>
              </div>
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl rounded-b-2xl border-t border-neutral-700">
          <div className="px-4 py-4 space-y-3">

            {/* Nav Items */}
            <div className="text-center space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="block text-black hover:text-fixes-accent-purple transition-colors duration-200 font-normal py-2 text-sm"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Auth / User Section */}
            <div className="pt-3 border-t border-neutral-700 space-y-2 text-center">
              {!user ? (
                <>
                </>
              ) : (
                <>
                  <div className="bg-black/30 rounded-2xl p-4 text-center">
                    <div className="w-12 h-12 bg-fixes-accent-purple rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-semibold">
                        {user.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <p className="text-white font-medium">{user.displayName || 'User'}</p>
                    <p className="text-neutral-300 text-sm">
                      {user.isAnonymous ? 'Anonymous Account' : user.email}
                    </p>
                    <p className="text-fixes-accent-purple text-xs capitalize mt-1">
                      {user.role}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      goToDashboard();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-fixes-accent-purple text-white px-6 py-2.5 rounded-full hover:bg-primary-600 transition-all duration-200 font-medium text-sm"
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

            {/* Social Media Icons */}
            <div className="flex items-center space-x-3 justify-center block lg:hidden">
              <a
                href="https://www.instagram.com/kalm_lk?igsh=dHJ1YWExNDg1Mmpz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 transition-colors duration-200"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/share/1UrHxB76WN/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@kalm_lkpodcast?si=QvVJa8eYRfSqNr2h"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors duration-200"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://vt.tiktok.com/ZSkySoCwe/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors duration-200"
                aria-label="Follow us on TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a
                href="mailto:team@kalm.lk"
                className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center hover:bg-[#D93025] transition-colors duration-200"
                aria-label="Email us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
