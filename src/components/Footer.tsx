import React from 'react';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/kalm.lk/logo icon (1).jpg" 
                alt="Kalm Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-2xl font-bold">kalm.lk</span>
            </div>
            <p className="text-neutral-300 leading-relaxed mb-6">
              For the thoughts you've never told anyone. Professional mental health support, 
              accessible and private.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@kalm.lk"
                className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors duration-200"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-neutral-300 hover:text-white transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="#services" className="text-neutral-300 hover:text-white transition-colors duration-200">
                  Services
                </a>
              </li>
              <li>
                <a href="#therapists" className="text-neutral-300 hover:text-white transition-colors duration-200">
                  Our Therapists
                </a>
              </li>
              <li>
                <a href="#faq" className="text-neutral-300 hover:text-white transition-colors duration-200">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-neutral-300 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-white transition-colors duration-200">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-white transition-colors duration-200">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-neutral-300">hello@kalm.lk</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-neutral-300">+94 77 123 4567</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-neutral-300">Colombo, Sri Lanka</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-neutral-400 text-sm">
              © 2024 Kalm.lk. All rights reserved.
            </p>
            <p className="text-neutral-400 text-sm mt-4 md:mt-0">
              Made with ❤️ for mental wellness in Sri Lanka
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;