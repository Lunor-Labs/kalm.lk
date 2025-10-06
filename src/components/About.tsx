import React from 'react';
import { Heart, Shield, Users } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-8 lg:py-12 bg-cream-50 relative">
       <div className="absolute inset-0 bg-black/10 pointer-events-none z-0"></div>
      {/* Subtle grain texture overlay for cream background */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-4">
            About Kalm
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make mental health support accessible, affordable, and stigma-free 
            for everyone in Sri Lanka. Your wellbeing matters, and we're here to help you thrive.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  Compassionate Care
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  Our licensed therapists provide empathetic, culturally-sensitive support 
                  tailored to the Sri Lankan context and your unique needs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  Complete Privacy
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  Your conversations are completely confidential and secure. 
                  We use end-to-end encryption to protect your privacy.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  Community Focus
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  Built specifically for Sri Lankans, understanding our culture, 
                  languages, and the unique challenges we face.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="About Calm.jpg?auto=compress&cs=tinysrgb&w=800"
              alt="Supportive therapy session"
              className="w-full h-80 lg:h-96 object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent rounded-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;