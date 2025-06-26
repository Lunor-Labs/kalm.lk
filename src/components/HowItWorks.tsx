import React from 'react';
import { UserPlus, Search, Calendar, MessageCircle } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Create your secure account in just a few minutes with basic information.',
      color: 'bg-primary-500'
    },
    {
      icon: Search,
      title: 'Browse Therapists',
      description: 'Explore our network of licensed therapists and find the right match for you.',
      color: 'bg-accent-green'
    },
    {
      icon: Calendar,
      title: 'Book a Session',
      description: 'Schedule your first session at a time that works best for your schedule.',
      color: 'bg-accent-yellow'
    },
    {
      icon: MessageCircle,
      title: 'Start Therapy',
      description: 'Begin your mental wellness journey with professional support and guidance.',
      color: 'bg-accent-orange'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
            How It Works
          </h2>
          <p className="text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Getting started with your mental wellness journey is simple and straightforward.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-cream-100 transform translate-x-6 -translate-y-1/2 z-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-cream-100 to-primary-200"></div>
                </div>
              )}
              
              <div className="relative z-10">
                <div className={`w-24 h-24 ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-neutral-600 shadow-md">
                  {index + 1}
                </div>
              </div>

              <h3 className="text-xl font-semibold text-neutral-800 mb-4">
                {step.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="bg-primary-500 text-white px-8 py-4 rounded-full hover:bg-primary-600 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;