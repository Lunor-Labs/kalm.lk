import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Therapists', href: '#therapists' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src="/logo icon (1).jpg" 
              alt="Kalm Logo" 
              className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg"
            />
            <span className={`text-lg lg:text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-neutral-800' : 'text-white'
            }`}>
              kalm.lk
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`hover:text-primary-500 transition-colors duration-200 font-medium text-sm ${
                  isScrolled ? 'text-neutral-600' : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <button className={`flex items-center space-x-2 hover:text-primary-600 transition-colors duration-200 font-medium text-sm px-3 py-2 rounded-lg ${
              isScrolled 
                ? 'text-primary-500 hover:bg-primary-50' 
                : 'text-white hover:bg-white/10'
            }`}>
              <Phone className="w-4 h-4" />
              <span>Call Us</span>
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className={`hover:text-primary-500 transition-colors duration-200 font-medium text-sm px-3 py-2 ${
                isScrolled ? 'text-neutral-600' : 'text-white/90 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="bg-primary-500 text-white px-4 py-2 rounded-full hover:bg-primary-600 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className={`w-5 h-5 ${isScrolled ? 'text-neutral-800' : 'text-white'}`} />
            ) : (
              <Menu className={`w-5 h-5 ${isScrolled ? 'text-neutral-800' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl rounded-b-2xl border-t border-cream-100">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-neutral-600 hover:text-primary-500 transition-colors duration-200 font-medium py-2 text-sm"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 border-t border-cream-100 space-y-2">
                <button className="flex items-center space-x-2 w-full text-left text-primary-500 hover:text-primary-600 transition-colors duration-200 font-medium py-2 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>Call Us</span>
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-neutral-600 hover:text-primary-500 transition-colors duration-200 font-medium py-2 text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('signup');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full bg-primary-500 text-white px-4 py-2.5 rounded-full hover:bg-primary-600 transition-all duration-200 font-medium text-center text-sm"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;