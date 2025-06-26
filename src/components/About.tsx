import React from 'react';
import { Heart, Shield, Users } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
            About Kalm
          </h2>
          <p className="text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make mental health support accessible, affordable, and stigma-free 
            for everyone in Sri Lanka. Your wellbeing matters, and we're here to help you thrive.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  Compassionate Care
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Our licensed therapists provide empathetic, culturally-sensitive support 
                  tailored to the Sri Lankan context and your unique needs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent-green" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  Complete Privacy
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Your conversations are completely confidential and secure. 
                  We use end-to-end encryption to protect your privacy.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-accent-yellow/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-yellow" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  Community Focus
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Built specifically for Sri Lankans, understanding our culture, 
                  languages, and the unique challenges we face.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Supportive therapy session"
              className="w-full h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent rounded-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;