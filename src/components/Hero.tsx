import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream-50 via-white to-primary-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-green/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-neutral-800 leading-tight mb-6">
              For the thoughts you've{' '}
              <span className="text-primary-500 relative">
                never told
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent-yellow/60" viewBox="0 0 200 12" fill="currentColor">
                  <path d="M0,8 Q50,0 100,8 T200,8 L200,12 L0,12 Z" />
                </svg>
              </span>{' '}
              anyone
            </h1>
            
            <p className="text-lg sm:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Connect with licensed therapists in Sri Lanka through our secure, private platform. 
              Your mental wellness journey starts here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button
                onClick={() => onOpenAuth('signup')}
                className="group bg-primary-500 text-white px-8 py-4 rounded-full hover:bg-primary-600 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              
              <button className="group flex items-center justify-center space-x-3 text-neutral-700 hover:text-primary-500 transition-colors duration-200 px-8 py-4 rounded-full border-2 border-neutral-200 hover:border-primary-500 bg-white/80 backdrop-blur-sm">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-cream-100">
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-primary-500 mb-1">500+</div>
                <div className="text-sm text-neutral-600">Happy Clients</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-primary-500 mb-1">50+</div>
                <div className="text-sm text-neutral-600">Licensed Therapists</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-primary-500 mb-1">24/7</div>
                <div className="text-sm text-neutral-600">Support Available</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
              <img
                src="https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Mental wellness consultation"
                className="w-full h-80 lg:h-96 object-cover rounded-2xl"
              />
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-accent-green text-white p-4 rounded-2xl shadow-lg animate-float">
                <div className="text-sm font-medium">✓ Secure & Private</div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-lg border border-cream-100 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                  <div className="text-sm font-medium text-neutral-700">Online Now</div>
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