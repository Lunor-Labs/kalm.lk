import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is Kalm?',
      answer: 'Kalm is a calm, online space to speak with licensed Sri Lankan therapists in a way that feels human, more like talking to a friend than attending a formal session. It\'s professional, but personal.'
    },
    {
      question: 'How does Kalm work?',
      answer: 'You can choose a service (like individual, couples, or family therapy), then browse verified therapists. Once you find someone who feels right, you pick a time slot based on their availability and book your session — video, audio, or text-based.'
    },
    {
      question: 'How do I book a therapist?',
      answer: 'Just choose the type of service you need, then explore our list of therapists — each with a photo, bio, availability, and style. Pick a time that suits you from their schedule and confirm your session. It\'s quick, clear, and designed for comfort.'
    },
    {
      question: 'Can I talk casually, like with a friend?',
      answer: 'Yes. Kalm is built for that. You can speak as formally or as casually as you like. Some people want structured advice. Others just want someone to talk to — like a friend who listens. Both are valid.'
    },
    {
      question: 'How do I pay?',
      answer: 'You can pay securely by credit or debit card, or through bank transfer — right before your session. Payments are fully safe, simple, and confirmed instantly once booked.'
    },
    {
      question: 'Is this only for people with "serious" issues?',
      answer: 'No. You don\'t have to be in crisis to talk to someone. You can come just to release, vent, ask for advice, talk about work stress, family tension, or anything that\'s on your mind. If it matters to you, it matters to us.'
    },
    {
      question: 'Can I stay anonymous?',
      answer: 'Yes. You can even book a session as a guest — no need to sign up or share personal details. We also offer audio-only and chat sessions, so you never have to show your face unless you want to. Just talk in a way that feels safe and right for you.'
    },
    {
      question: 'What session types do you offer?',
      answer: 'Video, voice, or text. Some people prefer typing it all out, some want face-to-face. You decide — it\'s your space. Every session also includes an optional pre-session note, so you can share how you\'re feeling before the call.'
    }
  ];

  return (
    <section id="faq" className="py-16 lg:py-24 bg-fixes-bg-purple relative font-body">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-medium text-5xl lg:text-6xl text-fixes-heading-dark mb-6">
            Frequently Asked Questions
          </h2>
          <p className="mt-6 text-lg font-light text-fixes-heading-dark">
            Get answers to common questions about our platform and services.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-background-purple border-b border-fixes-heading-dark transition-all duration-200`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full px-5 py-5 text-left flex items-center justify-between ${
                  openIndex === index 
                    ? 'bg-fixes-heading-dark/50' 
                    : 'hover:bg-fixes-heading-dark/50'
                } rounded-2xl transition-colors duration-200`}
              >
                <h3 className={`text-base font-light ${
                  openIndex === index ? 'text-black' : 'text-black'
                } pr-4`}>
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-4 h-4 text-fixes-heading-dark" />
                  ) : (
                    <Plus className="w-4 h-4 text-fixes-heading-dark" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-5 pb-3 bg-fixes-accent-purple">
                  <p className="text-base font-light text-black leading-relaxed pt-3">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQ;