import React from 'react';
import { Brain, Heart, Users2, Zap, CloudRain, Smile } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      icon: Brain,
      title: 'Anxiety',
      description: 'Professional support for managing anxiety, panic attacks, and worry.',
      image: 'https://images.pexels.com/photos/3807738/pexels-photo-3807738.jpeg?auto=compress&cs=tinysrgb&w=400',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: CloudRain,
      title: 'Depression',
      description: 'Compassionate care for depression, mood disorders, and emotional wellness.',
      image: 'https://images.pexels.com/photos/3807755/pexels-photo-3807755.jpeg?auto=compress&cs=tinysrgb&w=400',
      color: 'from-accent-green to-primary-500'
    },
    {
      icon: Heart,
      title: 'Relationship Issues',
      description: 'Guidance for couples, family conflicts, and relationship challenges.',
      image: 'https://images.pexels.com/photos/3807760/pexels-photo-3807760.jpeg?auto=compress&cs=tinysrgb&w=400',
      color: 'from-accent-pink to-accent-orange'
    },
    {
      icon: Zap,
      title: 'Stress Management',
      description: 'Learn effective techniques to manage work stress and life pressures.',
      image: 'https://images.pexels.com/photos/3807717/pexels-photo-3807717.jpeg?auto=compress&cs=tinysrgb&w=400',
      color: 'from-accent-yellow to-accent-orange'
    },
    {
      icon: Users2,
      title: 'Grief & Loss',
      description: 'Support through difficult times of loss, bereavement, and major life changes.',
      image: 'https://images.pexels.com/photos/3807732/pexels-photo-3807732.jpeg?auto=compress&cs=tinysrgb&w=400',
      color: 'from-neutral-400 to-neutral-600'
    },
    {
      icon: Smile,
      title: 'Personal Growth',
      description: 'Build confidence, self-esteem, and achieve your personal development goals.',
      image: 'https://images.pexels.com/photos/3807743/pexels-photo-3807743.jpeg?auto=compress&cs=tinysrgb&w=400',
      color: 'from-accent-green to-accent-yellow'
    }
  ];

  return (
    <section id="services" className="py-20 lg:py-32 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
            Our Services
          </h2>
          <p className="text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            We provide specialized support for a wide range of mental health concerns.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-80`}></div>
                <div className="absolute top-6 left-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">
                  {service.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  {service.description}
                </p>
                <button className="text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200 flex items-center space-x-2 group">
                  <span>Get Started</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;