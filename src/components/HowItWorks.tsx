import React from 'react';
import { UserPlus, Search, Calendar, MessageCircle, Play } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Get Started',
      description: 'Create a secure account in minutes, or join without sharing details.',
      color: 'bg-primary-500'
    },
    {
      icon: Search,
      title: 'Choose a Service',
      description: 'Pick the type of support you need, whether it\'s teen, individual, or couples therapy.',
      color: 'bg-accent-green'
    },
    {
      icon: Calendar,
      title: 'Find Your Therapist',
      description: 'Browse our network of professionals and choose the one who feels right for you.',
      color: 'bg-accent-yellow'
    },
    {
      icon: MessageCircle,
      title: 'Book Your Session',
      description: 'Select a time that fits your schedule. You\'ll see the rate upfront, no surprises.',
      color: 'bg-accent-orange'
    },
    {
      icon: Play,
      title: 'Start Therapy',
      description: 'Join your session via video, voice, or text, however you feel most comfortable. It\'s real support, on your terms.',
      color: 'bg-accent-pink'
    }
  ];

  return (
    <section id="how-it-works" className="py-8 lg:py-12 bg-cream-50 relative">
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-0"></div>
      {/* Subtle grain texture overlay for cream background */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-4">
            How It Works
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Getting started with your mental wellness journey is simple and straightforward.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              <div className="relative z-10">
                <div className={`w-20 h-20 ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="absolute top-[-1.7rem] left-1/2 -translate-x-1/2 sm:-top-1 sm:right-[-0.25rem] sm:left-auto sm:translate-x-0 w-6 h-6 bg-cream-50 border-2 border-neutral-200 rounded-full flex items-center justify-center text-xs font-bold text-neutral-800 shadow-md">
                  {index + 1}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                {step.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;