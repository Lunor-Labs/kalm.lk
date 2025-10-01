import React from 'react';
import { X, Shield, Lock, Eye, Database, Users, AlertTriangle } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-cream-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              {isTerms ? (
                <Shield className="w-5 h-5 text-white" />
              ) : (
                <Lock className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">
                {isTerms ? 'Terms of Service' : 'Privacy Policy'}
              </h2>
              <p className="text-neutral-600 text-sm">
                {isTerms ? 'Last updated: January 2024' : 'Last updated: January 2024'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {isTerms ? (
            <div className="space-y-6 text-sm">
              {/* Introduction */}
              <section>
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-neutral-800">Introduction</h3>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  Welcome to Kalm.lk ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our mental health platform and services. By accessing or using our platform, you agree to be bound by these Terms.
                </p>
              </section>

              {/* Key Terms */}
              <section>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Key Terms</h3>
                <div className="space-y-4 text-neutral-600">
                  <div>
                    <strong className="text-neutral-800">Services:</strong> We connect users with licensed mental health professionals for video, audio, and chat therapy sessions.
                  </div>
                  <div>
                    <strong className="text-neutral-800">Eligibility:</strong> Must be 13+ (under 18 requires parental consent) and provide accurate information.
                  </div>
                  <div>
                    <strong className="text-neutral-800">User Responsibilities:</strong> Use lawfully, respect privacy, provide honest information, attend/cancel sessions appropriately.
                  </div>
                  <div>
                    <strong className="text-neutral-800">Therapists:</strong> Independently licensed professionals (we don't provide medical advice directly).
                  </div>
                  <div>
                    <strong className="text-neutral-800">Payment:</strong> Fees displayed before booking, processed securely via PayHere.
                  </div>
                  <div>
                    <strong className="text-neutral-800">Privacy:</strong> All communications encrypted and confidential.
                  </div>
                  <div>
                    <strong className="text-neutral-800">Liability:</strong> We're not liable for therapy outcomes, therapist actions, or technical issues beyond our control.
                  </div>
                  <div>
                    <strong className="text-neutral-800">Termination:</strong> Accounts can be deleted anytime or suspended for violations.
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section>
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">Contact Information</h3>
                  <div className="space-y-1 text-neutral-600">
                    <p><strong>Email:</strong> legal@kalm.lk</p>
                    <p><strong>Phone:</strong> +94 (76) 633 0360</p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-6 text-sm">
              {/* Introduction */}
              <section>
                <div className="flex items-center space-x-2 mb-3">
                  <Lock className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-neutral-800">Our Commitment to Privacy</h3>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  At Kalm.lk, we understand that privacy is fundamental to mental health care. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our platform.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Information We Collect</h3>
                <div className="space-y-4 text-neutral-600">
                  <div>
                    <strong className="text-neutral-800">Personal Information:</strong> Name, email, phone, account credentials, payment information, communication preferences.
                  </div>
                  <div>
                    <strong className="text-neutral-800">Health Information:</strong> Information shared during therapy sessions, session notes, treatment preferences.
                  </div>
                  <div>
                    <strong className="text-neutral-800">Technical Information:</strong> Device information, usage patterns, session logs.
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">How We Use Your Information</h3>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 ml-4">
                  <li>Provide and improve our mental health services</li>
                  <li>Connect you with appropriate therapists</li>
                  <li>Process payments and manage your account</li>
                  <li>Send important updates and notifications</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Information Sharing</h3>
                <div className="bg-accent-green/10 border border-accent-green/20 rounded-xl p-4">
                  <div className="flex items-start space-x-2">
                    <Eye className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                    <div className="text-neutral-600">
                      <p className="font-semibold text-neutral-800 mb-2">We do not sell your personal information.</p>
                      <p>We may share information only in these limited circumstances:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                        <li>With your chosen therapist for treatment purposes</li>
                        <li>With your explicit consent</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect safety in emergency situations</li>
                        <li>With service providers who assist our operations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Data Security</h3>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 ml-4">
                  <li>End-to-end encryption for all communications</li>
                  <li>Secure data storage with Firebase</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure payment processing through PayHere</li>
                </ul>
              </section>

              {/* Your Rights */}
              <section>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Your Privacy Rights</h3>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Request data portability</li>
                  <li>File complaints with regulatory authorities</li>
                </ul>
              </section>

              {/* Contact */}
              <section>
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">Contact Us</h3>
                  <div className="space-y-1 text-neutral-600">
                    <p><strong>Privacy Officer:</strong> privacy@kalm.lk</p>
                    <p><strong>General Contact:</strong> hello@kalm.lk</p>
                    <p><strong>Phone:</strong> +94 (76) 633 0360</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LegalModal;
