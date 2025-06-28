import React from 'react';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-900">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content - Now on the left */}
          <div className="text-center lg:text-left animate-slide-up order-1 lg:order-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              For the thoughts you've{' '}
              <span className="text-primary-500">
                never told
              </span>{' '}
              anyone
            </h1>
            
            <p className="text-base sm:text-lg text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Connect with licensed therapists in Sri Lanka through our secure, private platform. 
              Your mental wellness journey starts here.
            </p>

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

          {/* Video Section - Now on the right */}
          <div className="relative animate-fade-in order-2 lg:order-2">
            <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-64 lg:h-80 object-cover rounded-2xl"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                {/* Fallback image if video doesn't load */}
                <img
                  src="https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Mental wellness consultation"
                  className="w-full h-64 lg:h-80 object-cover rounded-2xl"
                />
              </video>
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