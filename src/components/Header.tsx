import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Instagram, Mail, MapPin, Facebook, Youtube } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const [mobileRightMargin, setMobileRightMargin] = useState<string>('-12rem');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const el = document.getElementById(hash);
        if (el) {
          const headerHeight = document.querySelector('header')?.offsetHeight || 0;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - headerHeight,
            behavior: 'smooth',
          });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Smooth marginRight calculation across widths (linear interpolation)
  useEffect(() => {
    const minW = 360; // px
    const maxW = 1020; // px
    const minRem = -6; // rem at minW
    const maxRem = -27; // rem at maxW

    const interpolate = (w: number) => {
      if (w <= minW) return minRem;
      if (w >= maxW) return maxRem;
      const t = (w - minW) / (maxW - minW);
      return minRem + t * (maxRem - minRem);
    };

    let rafId: number | null = null;

    const updateMargin = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const w = window.innerWidth;
        const remValue = interpolate(w);
        // format to 4 decimal places to avoid long floats
        setMobileRightMargin(`${remValue.toFixed(4)}rem`);
      });
    };

    updateMargin();
    window.addEventListener('resize', updateMargin);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateMargin);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // toast.success('Signed out successfully');
      setShowProfileMenu(false);
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-black shadow-lg transition-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo (click to go to homepage) */}
          <button
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsMenuOpen(false);
              } else {
                navigate('/');
              }
            }}
            className="flex items-center space-x-2 flex-shrink-0 cursor-pointer focus:outline-none"
            aria-label="Go to homepage"
          >
            <img
              src="logo.jpg"
              alt="Kalm Logo"
              className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg"
            />
            <span className={`text-lg lg:text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-white' : 'text-white'
            }`}>
              kalm.lk
            </span>
          </button>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-10">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={e => handleNavClick(e, item.href)}
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

                {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-sm border border-neutral-700 rounded-2xl shadow-xl z-50">                    <div className="p-4 border-b border-neutral-700">
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

            <div className="pr-4 pt-3 flex items-center justify-end border-t border-neutral-700 mb-3 lg:hidden">
              {/* Adjust the marginRight value below to move this block further from the right edge as you wish */}
              <div
                className="flex items-center justify-end gap-3 overflow-x-auto px-2 py-2"
                style={{ marginRight: mobileRightMargin }}
              >
                {!user ? (
                  <>
                  <a
                    href={`tel:${phoneNumberForCall}`}
                    className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 transition-colors duration-200 font-medium text-sm"
                  >
                    <div className="w-7 h-7 rounded-full border border-white flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    {/* <span>Call Us</span> */}
                  </a>
                <button
                  onClick={() => {
                  onOpenAuth('login');
                  setIsMenuOpen(false);
                  }}
                  className="bg-transparent text-white px-4 py-1.5 rounded-full hover:bg-primary-600 transition-all duration-200 font-medium text-sm whitespace-nowrap border border-white"
                  >
                  Login
                </button>
              </>
            ) : (
              <>
          {/* Profile Initial */}
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0">
              {user.displayName?.charAt(0) || 'U'}
            </div>
          
          {/* Dashboard Button */}
            {/* <button
              onClick={() => {
                goToDashboard();
                setIsMenuOpen(false);
              }}
              className="bg-primary-500 text-white px-3 py-1 rounded-full hover:bg-primary-600 transition-all duration-200 font-medium text-xs whitespace-nowrap"
            >
              Dashboard
            </button> */}

          {/* Sign Out Button */}
            <button
              onClick={() => {
                handleSignOut();
                setIsMenuOpen(false);
              }}
              className="text-neutral-300 hover:text-white transition-colors duration-200 text-xs whitespace-nowrap"
            >
              Sign Out
            </button>
          </>
        )}
    
        </div>
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
          <div className="lg:hidden absolute top-full left-0 right-0 bg-neutral-900 shadow-xl rounded-b-2xl border-t border-neutral-700">
            <div className="px-4 py-4 space-y-3">
              <div className="text-center space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={e => handleNavClick(e, item.href)}
                    className="block text-neutral-300 hover:text-primary-500 transition-colors duration-200 font-medium py-2 text-sm"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              
              <div className="pt-3 border-t border-neutral-700 space-y-2 text-center">
                {!user ? (
                  <>
                    {/* <a
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
                    </div> */}
                  </>
                ) : (
                  <>
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
          {/* <div className="pt-3 border-t border-neutral-700 space-y-2 text-center"></div> */}
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
      </div>

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