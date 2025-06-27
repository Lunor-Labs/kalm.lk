import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Mental wellness background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-green/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4">
              For the thoughts you've{' '}
              <span className="text-primary-500 relative">
                never told
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent-yellow/60" viewBox="0 0 200 12" fill="currentColor">
                  <path d="M0,8 Q50,0 100,8 T200,8 L200,12 L0,12 Z" />
                </svg>
              </span>{' '}
              anyone
            </h1>
            
            <p className="text-base sm:text-lg text-white/90 mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Connect with licensed therapists in Sri Lanka through our secure, private platform. 
              Your mental wellness journey starts here.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <button
                onClick={() => onOpenAuth('signup')}
                className="group bg-primary-500 text-white px-6 py-3 rounded-full hover:bg-primary-600 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
              <div className="text-center lg:text-left">
                <div className="text-xl lg:text-2xl font-bold text-primary-500 mb-1">500+</div>
                <div className="text-xs text-white/80">Happy Clients</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl lg:text-2xl font-bold text-primary-500 mb-1">50+</div>
                <div className="text-xs text-white/80">Licensed Therapists</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl lg:text-2xl font-bold text-primary-500 mb-1">24/7</div>
                <div className="text-xs text-white/80">Support Available</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8">
              <img
                src="https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Mental wellness consultation"
                className="w-full h-64 lg:h-80 object-cover rounded-2xl"
              />
              
              {/* Floating Elements */}
              <div className="absolute -top-3 -right-3 bg-accent-green text-white p-3 rounded-2xl shadow-lg animate-float">
                <div className="text-xs font-medium">✓ Secure & Private</div>
              </div>
              
              <div className="absolute -bottom-3 -left-3 bg-white p-3 rounded-2xl shadow-lg border border-cream-100 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                  <div className="text-xs font-medium text-neutral-700">Online Now</div>
                </div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-green/20 rounded-3xl transform rotate-3 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;