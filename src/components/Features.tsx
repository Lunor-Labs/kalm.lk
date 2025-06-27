import React from 'react';
import { MessageCircle, Video, Smartphone, CreditCard, Clock, Lock } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Secure Chat',
      description: 'End-to-end encrypted messaging with your therapist anytime, anywhere.',
      color: 'bg-primary-100 text-primary-500'
    },
    {
      icon: Video,
      title: 'Video & Audio Calls',
      description: 'Face-to-face sessions or voice-only calls based on your comfort level.',
      color: 'bg-accent-green/20 text-accent-green'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Optimized for mobile devices with a seamless, intuitive experience.',
      color: 'bg-accent-yellow/20 text-accent-yellow'
    },
    {
      icon: CreditCard,
      title: 'Local Payment Support',
      description: 'Pay easily with local payment methods including mobile wallets.',
      color: 'bg-accent-orange/20 text-accent-orange'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book sessions that fit your schedule, including evenings and weekends.',
      color: 'bg-accent-pink/20 text-accent-pink'
    },
    {
      icon: Lock,
      title: 'Licensed Therapists',
      description: 'All our therapists are licensed professionals with verified credentials.',
      color: 'bg-neutral-200 text-neutral-600'
    }
  ];

  return (
    <section className="py-12 lg:py-16 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-4">
            Why Choose Kalm?
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            We've built a platform that puts your comfort, privacy, and convenience first.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
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