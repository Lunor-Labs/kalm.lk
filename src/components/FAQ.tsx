import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does online therapy work?',
      answer: 'Online therapy works through secure video calls, voice calls, or text messaging with licensed therapists. You can schedule sessions at your convenience and connect from anywhere with an internet connection. All sessions are private and confidential.'
    },
    {
      question: 'Are your therapists licensed?',
      answer: 'Yes, all our therapists are licensed mental health professionals with verified credentials. They have completed their education, training, and certification requirements to practice therapy in Sri Lanka.'
    },
    {
      question: 'Is my information secure and private?',
      answer: 'Absolutely. We use end-to-end encryption for all communications and follow strict privacy protocols. Your personal information and therapy sessions are completely confidential and secure.'
    },
    {
      question: 'How much does it cost?',
      answer: 'Our pricing is transparent and affordable. Individual therapy sessions start from LKR 3,500 per session. We also offer package deals and accept various local payment methods including mobile wallets.'
    },
    {
      question: 'Can I switch therapists if needed?',
      answer: 'Yes, you can switch therapists at any time if you feel you need a better match. We want you to feel comfortable and supported, so finding the right therapist is important for your success.'
    },
    {
      question: 'What if I need emergency support?',
      answer: 'For mental health emergencies, please contact your local emergency services immediately. Kalm is designed for ongoing therapy support, not crisis intervention. We can provide resources for emergency support when needed.'
    }
  ];

  return (
    <section id="faq" className="py-20 lg:py-32 bg-cream-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg lg:text-xl text-neutral-600 leading-relaxed">
            Get answers to common questions about our platform and services.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-cream-50 rounded-2xl transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-neutral-800 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-primary-500" />
                  ) : (
                    <Plus className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <p className="text-neutral-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-neutral-600 mb-4">
            Still have questions?
          </p>
          <button className="text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200">
            Contact our support team
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;