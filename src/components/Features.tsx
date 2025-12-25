import React from 'react';
import { MessageCircle, Video, Smartphone, CreditCard, Clock, Lock } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Secure Chat',
      description: 'End-to-end encrypted messaging with your therapist anytime, anywhere.',
      color: 'bg-primary-500/20 text-primary-500',
      bg: '#A9E8E8',
    },
    {
      icon: Video,
      title: 'Video & Audio Calls',
      description: 'Face-to-face sessions or voice-only calls based on your comfort level.',
      color: 'bg-accent-green/20 text-accent-green',
      bg: '#D2CCF2',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Optimized for mobile devices with a seamless, intuitive experience.',
      color: 'bg-accent-yellow/20 text-accent-yellow',
      bg: '#B2EAD3',
    },
    {
      icon: CreditCard,
      title: 'Local Payment Support',
      description: 'Pay easily with local payment methods including mobile wallets.',
      color: 'bg-accent-orange/20 text-accent-orange',
      bg: '#F68BA2',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book sessions that fit your schedule, including evenings and weekends.',
      color: 'bg-accent-pink/20 text-accent-pink',
      bg: '#F5E29E',
    },
    {
      icon: Lock,
      title: 'Licensed Therapists',
      description: 'All our therapists are licensed professionals with verified credentials.',
      color: 'bg-neutral-600/20 text-neutral-300',
      bg: '#C8EBEF',
    }
  ];

  return (
    <section className="py-20 lg:py-24 bg-fixes-bg-white relative font-body">
      {/* Grain texture overlay */}
      {/* <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div> */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-medium text-5xl lg:text-6xl text-fixes-heading-dark mb-6">
            Why Choose Kalm?
          </h2>
          <p className="mt-6 text-lg font-light text-fixes-heading-dark">
            We've built a platform that puts your comfort, privacy, and convenience first.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 justify-items-center">
          {features.map((feature, index) => (
            <div
              key={index}
              style={{ backgroundColor: feature.bg }}
              className="group w-full min-h-[200px] p-6 flex flex-col justify-center items-center rounded-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <h3 className="font-body font-medium text-xl text-black text-center mb-3">
                {feature.title}
              </h3>
              <p className="font-body font-light text-black text-center text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;