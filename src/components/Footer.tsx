import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Mail, Phone, MapPin, Facebook, Youtube } from 'lucide-react';

// Shared utility function for scrolling to a section with header offset
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: elementPosition - headerHeight,
      behavior: 'smooth',
    });
    window.history.pushState(null, '', `#${id}`);
  } else {
    console.warn(`Element with ID "${id}" not found`);
  }
};

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const navigateToPage = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  // Handle initial hash navigation on page load or hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        scrollToSection(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <footer className="bg-black text-white relative">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-[4fr_1fr_2fr_2fr_2fr] gap-8">
          {/* Brand */}
          <div className="lg:col-span-1 text-center md:text-left">
            <div className="flex items-center space-x-2 mb-4 justify-center md:justify-start">
              <img 
                src="logo.jpg" 
                alt="Kalm Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold">kalm.lk</span>
            </div>
            <p className="text-neutral-400 leading-relaxed mb-6 text-sm">
              For the thoughts you've never told anyone. Professional mental health support, 
              accessible and private.
            </p>
            <div className="flex items-center space-x-3 justify-center md:justify-start">
              <a
                href="https://www.instagram.com/kalm_lk?igsh=dHJ1YWExNDg1Mmpz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 transition-colors duration-200"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/share/1UrHxB76WN/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@kalm_lkpodcast?si=QvVJa8eYRfSqNr2h"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors duration-200"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://vt.tiktok.com/ZSkySoCwe/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors duration-200"
                aria-label="Follow us on TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a
                href="mailto:team@kalm.lk"
                className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-[#D93025] transition-colors duration-200"
                aria-label="Email us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Spacer column */}
          <div className="lg:col-span-1 hidden lg:block"></div>

          {/* Quick Links */}
          <div className="lg:col-span-1 text-center md:text-left">
            <h4 className="text-base font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', id: 'about' },
                { label: 'Services', id: 'services' },
                { label: 'Our Therapists', id: 'therapists' },
                { label: 'FAQ', id: 'faq' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-1 text-center md:text-left">
            <h4 className="text-base font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigateToPage('/privacy-policy')}
                  className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToPage('/terms-of-service')}
                  className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToPage('/refund-policy')}
                  className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToPage('/terms-of-service')}
                  className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Disclaimer
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-1 text-center md:text-left">
            <h4 className="text-base font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 justify-center md:justify-start">
                <Mail className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <a 
                    href="mailto:team@kalm.lk"
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    team@kalm.lk
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-2 justify-center md:justify-start">
                <Phone className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <a 
                    href="tel:+94766330360"
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    +94 (76) 633 0360
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-2 justify-center md:justify-start">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Colombo%2C+Sri+Lanka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Colombo, Sri Lanka
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-neutral-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <p className="text-neutral-500 text-xs">
              © 2024 Kalm.lk. All rights reserved.
            </p>
            <p className="text-neutral-500 text-xs mt-2 md:mt-0">
              Made with ❤️ for mental wellness in Sri Lanka
            </p>
            <p className="text-neutral-500 text-xs mt-2 md:mt-0">
              Developed by <a href="https://lunorlabs.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-700">Lunor Labs</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;