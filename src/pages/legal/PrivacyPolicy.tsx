import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
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
                <Lock className="w-6 h-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-white">Our Commitment to Privacy</h2>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                At Kalm.lk, we understand that privacy is fundamental to mental health care. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-primary-500 mb-3">Personal Information</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-neutral-300">
                    <li>Name, email address, and phone number</li>
                    <li>Account credentials and profile information</li>
                    <li>Payment information (processed securely through PayHere)</li>
                    <li>Communication preferences</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-primary-500 mb-3">Health Information</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-neutral-300">
                    <li>Information shared during therapy sessions</li>
                    <li>Session notes and records</li>
                    <li>Treatment preferences and history</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-primary-500 mb-3">Technical Information</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-neutral-300">
                    <li>Device information and IP address</li>
                    <li>Usage patterns and platform interactions</li>
                    <li>Session logs and technical diagnostics</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h3>
              <div className="space-y-4 text-neutral-300">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and improve our mental health services</li>
                  <li>Connect you with appropriate therapists</li>
                  <li>Process payments and manage your account</li>
                  <li>Send important updates and notifications</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">3. Information Sharing</h3>
              <div className="bg-accent-green/10 border border-accent-green/20 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <Eye className="w-6 h-6 text-accent-green flex-shrink-0 mt-1" />
                  <div className="space-y-4 text-neutral-300">
                    <p><strong>We do not sell your personal information.</strong></p>
                    <p>We may share information only in these limited circumstances:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>With your chosen therapist for treatment purposes</li>
                      <li>With your explicit consent</li>
                      <li>To comply with legal obligations</li>
                      <li>To protect safety in emergency situations</li>
                      <li>With service providers who assist our operations (under strict confidentiality)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">4. Data Security</h3>
              <div className="space-y-4 text-neutral-300">
                <p>We implement comprehensive security measures:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>End-to-end encryption for all communications</li>
                  <li>Secure data storage with Firebase</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure payment processing through PayHere</li>
                </ul>
              </div>
            </section>

            {/* Anonymous Accounts */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">5. Anonymous Accounts</h3>
              <div className="space-y-4 text-neutral-300">
                <p>For users who choose anonymous accounts:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We collect minimal personal information</li>
                  <li>Your identity remains protected</li>
                  <li>Session data is still encrypted and secure</li>
                  <li>You can upgrade to a regular account anytime</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">6. Your Privacy Rights</h3>
              <div className="space-y-4 text-neutral-300">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Request data portability</li>
                  <li>File complaints with regulatory authorities</li>
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">7. Data Retention</h3>
              <div className="space-y-4 text-neutral-300">
                <p>We retain your information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>For as long as your account is active</li>
                  <li>As required by law or regulation</li>
                  <li>To resolve disputes or enforce agreements</li>
                  <li>Session records may be retained for therapeutic continuity</li>
                </ul>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">8. Children's Privacy</h3>
              <div className="space-y-4 text-neutral-300">
                <p>For users under 18:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Parental consent is required</li>
                  <li>Additional privacy protections apply</li>
                  <li>Parents may access their child's information</li>
                  <li>Special care is taken with sensitive information</li>
                </ul>
              </div>
            </section>

            {/* Updates to Policy */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">9. Updates to This Policy</h3>
              <p className="text-neutral-300">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notifications. The "Last updated" date at the top indicates when changes were made.
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
                  For privacy-related questions or to exercise your rights, contact us:
                </p>
                <div className="space-y-2 text-neutral-300">
                  <p><strong>Privacy Officer:</strong> privacy@kalm.lk</p>
                  <p><strong>General Contact:</strong> hello@kalm.lk</p>
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

export default PrivacyPolicy;