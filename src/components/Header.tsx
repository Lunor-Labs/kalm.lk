import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

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
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/kalm.lk/logo icon (1).jpg" 
              alt="Kalm Logo" 
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg"
            />
            <span className="text-xl lg:text-2xl font-bold text-neutral-800">
              kalm.lk
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-neutral-600 hover:text-primary-500 transition-colors duration-200 font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => onOpenAuth('login')}
              className="text-neutral-600 hover:text-primary-500 transition-colors duration-200 font-medium"
            >
              Login
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="bg-primary-500 text-white px-6 py-2.5 rounded-full hover:bg-primary-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-cream-100 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-neutral-800" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-800" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl rounded-b-2xl border-t border-cream-100">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-neutral-600 hover:text-primary-500 transition-colors duration-200 font-medium py-2"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-cream-100 space-y-3">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-neutral-600 hover:text-primary-500 transition-colors duration-200 font-medium py-2"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('signup');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full bg-primary-500 text-white px-6 py-3 rounded-full hover:bg-primary-600 transition-all duration-200 font-medium text-center"
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