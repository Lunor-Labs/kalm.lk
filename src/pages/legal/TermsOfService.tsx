import React from 'react';
import { ArrowLeft, Shield, FileText, Users, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900 relative">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Terms and Conditions</h1>
              <p className="text-neutral-300">Last updated: January 2024</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl border border-neutral-800 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-white">Introduction</h2>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                Welcome to Kalm.lk ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our mental health platform and services. By accessing or using our platform, you agree to be bound by these Terms.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h3>
              <div className="space-y-4 text-neutral-300">
                <p>By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.</p>
                <p>If you do not agree with any part of these Terms, you must not use our services.</p>
              </div>
            </section>

            {/* Description of Services */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">2. Description of Services</h3>
              <div className="space-y-4 text-neutral-300">
                <p>Kalm.lk provides an online platform that connects users with licensed mental health professionals for therapy sessions through:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Video conferencing sessions</li>
                  <li>Audio-only sessions</li>
                  <li>Text-based chat sessions</li>
                  <li>Scheduling and booking services</li>
                  <li>Secure communication tools</li>
                </ul>
              </div>
            </section>

            {/* User Eligibility */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">3. User Eligibility</h3>
              <div className="space-y-4 text-neutral-300">
                <p>To use our services, you must:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Be at least 13 years old (users under 18 require parental consent)</li>
                  <li>Have the legal capacity to enter into binding agreements</li>
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                </ul>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">4. User Responsibilities</h3>
              <div className="space-y-4 text-neutral-300">
                <p>As a user of our platform, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the platform only for lawful purposes</li>
                  <li>Respect the privacy and rights of other users and therapists</li>
                  <li>Provide honest and accurate information to your therapist</li>
                  <li>Attend scheduled sessions or cancel with appropriate notice</li>
                  <li>Not share your account with others</li>
                  <li>Not attempt to circumvent security measures</li>
                </ul>
              </div>
            </section>

            {/* Therapist Services */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">5. Therapist Services</h3>
              <div className="space-y-4 text-neutral-300">
                <p>Our platform connects you with licensed mental health professionals. Please note:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All therapists are independently licensed professionals</li>
                  <li>Kalm.lk does not provide medical advice or treatment</li>
                  <li>We facilitate connections but do not control therapy content</li>
                  <li>Emergency services are not available through our platform</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">6. Payment Terms</h3>
              <div className="space-y-4 text-neutral-300">
                <p>Payment for services is processed through our secure payment system:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All fees are clearly displayed before booking</li>
                  <li>Payment is required at the time of booking</li>
                  <li>Refunds are subject to our Refund Policy</li>
                  <li>We use PayHere for secure payment processing</li>
                </ul>
              </div>
            </section>

            {/* Privacy and Confidentiality */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">7. Privacy and Confidentiality</h3>
              <div className="space-y-4 text-neutral-300">
                <p>We are committed to protecting your privacy:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All communications are encrypted and secure</li>
                  <li>We comply with applicable privacy laws</li>
                  <li>Your therapy sessions remain confidential</li>
                  <li>See our Privacy Policy for detailed information</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">8. Limitation of Liability</h3>
              <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-accent-orange flex-shrink-0 mt-1" />
                  <div className="space-y-4 text-neutral-300">
                    <p>Kalm.lk provides a platform for connecting users with therapists but does not provide medical or therapeutic services directly.</p>
                    <p>We are not liable for:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>The quality or outcome of therapy sessions</li>
                      <li>Actions or advice provided by therapists</li>
                      <li>Technical issues beyond our reasonable control</li>
                      <li>Any damages arising from use of our platform</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">9. Termination</h3>
              <div className="space-y-4 text-neutral-300">
                <p>Either party may terminate this agreement:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may delete your account at any time</li>
                  <li>We may suspend or terminate accounts for violations</li>
                  <li>Termination does not affect completed transactions</li>
                  <li>Some provisions survive termination</li>
                </ul>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">10. Governing Law</h3>
              <p className="text-neutral-300">
                These Terms are governed by the laws of Sri Lanka. Any disputes will be resolved in the courts of Sri Lanka.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">11. Changes to Terms</h3>
              <p className="text-neutral-300">
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notifications. Continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-white">Contact Us</h2>
              </div>
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-6">
                <p className="text-neutral-300 mb-4">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <div className="space-y-2 text-neutral-300">
                  <p><strong>Email:</strong> legal@kalm.lk</p>
                  <p><strong>Phone:</strong> +94 (76) 633 0360</p>
                  <p><strong>Address:</strong> Colombo, Sri Lanka</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;