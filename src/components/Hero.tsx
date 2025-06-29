import React from 'react';
import { User, UserCheck, Shield, Check, X } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  const comparisonFeatures = [
    {
      feature: 'Setup',
      regular: { text: 'Email & secure account', hasFeature: true },
      guest: { text: 'No personal info needed', hasFeature: true }
    },
    {
      feature: 'Chat History',
      regular: { text: 'Saved & accessible', hasFeature: true },
      guest: { text: 'Session-based only', hasFeature: false }
    },
    {
      feature: 'Reminders',
      regular: { text: 'Email updates & alerts', hasFeature: true },
      guest: { text: 'No follow-ups', hasFeature: false }
    },
    {
      feature: 'Privacy',
      regular: { text: 'Private & secure', hasFeature: true },
      guest: { text: 'Fully anonymous', hasFeature: true }
    }
  ];

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

            {/* Account Type Comparison - Compact Version */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-6 text-center lg:text-left">
                Choose How You Want to Join
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Regular Account */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Regular Account</h3>
                      <p className="text-white/70 text-sm">Full features</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {comparisonFeatures.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {item.regular.hasFeature ? (
                          <Check className="w-3 h-3 text-accent-green flex-shrink-0" />
                        ) : (
                          <X className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        )}
                        <span className="text-white/80 text-xs">{item.regular.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-xl font-medium text-sm transition-colors duration-200"
                  >
                    Sign Up
                  </button>
                </div>

                {/* Guest Account */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-accent-green/20 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-accent-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Guest Account</h3>
                      <p className="text-white/70 text-sm">Privacy-first</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {comparisonFeatures.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {item.guest.hasFeature ? (
                          <Check className="w-3 h-3 text-accent-green flex-shrink-0" />
                        ) : (
                          <X className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        )}
                        <span className="text-white/80 text-xs">{item.guest.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="w-full bg-accent-green hover:bg-accent-green/90 text-white py-2.5 rounded-xl font-medium text-sm transition-colors duration-200"
                  >
                    Join Anonymously
                  </button>
                </div>
              </div>

              {/* Privacy Note */}
              <div className="flex items-center justify-center space-x-2 text-center">
                <Shield className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <p className="text-white/70 text-xs">
                  You can upgrade from guest to regular account anytime
                </p>
              </div>
            </div>

            {/* Stats - Now only 2 stats, arranged nicely */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/20 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-primary-500 mb-2">500+</div>
                <div className="text-sm text-white/80">Happy Clients</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl lg:text-3xl font-bold text-primary-500 mb-2">50+</div>
                <div className="text-sm text-white/80">Licensed Therapists</div>
              </div>
            </div>
          </div>

          {/* Video Section - Now on the right */}
          <div className="relative animate-fade-in order-2 lg:order-2">
            <div className="relative z-10 rounded-3xl shadow-2xl overflow-hidden border-2 border-white/20">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-72 lg:h-96 object-cover"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                {/* Fallback image if video doesn't load */}
                <img
                  src="https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Mental wellness consultation"
                  className="w-full h-72 lg:h-96 object-cover"
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