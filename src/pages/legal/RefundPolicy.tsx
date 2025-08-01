import React from 'react';
import { ArrowLeft, CreditCard, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RefundPolicy: React.FC = () => {
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
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Refund Policy</h1>
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
                <CreditCard className="w-6 h-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-white">Our Refund Commitment</h2>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                We want you to be completely satisfied with our services. This Refund Policy outlines the circumstances under which refunds are available and the process for requesting them.
              </p>
            </section>

            {/* Refund Eligibility */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">1. Refund Eligibility</h3>
              
              {/* Full Refund Scenarios */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-accent-green" />
                  <h4 className="text-lg font-medium text-accent-green">100% Refund Available</h4>
                </div>
                <ul className="list-disc list-inside space-y-2 ml-8 text-neutral-300">
                  <li>Cancellation more than 24 hours before scheduled session</li>
                  <li>Therapist cancels or fails to attend the session</li>
                  <li>Technical issues prevent the session from occurring</li>
                  <li>Platform downtime or service unavailability</li>
                  <li>Duplicate or erroneous charges</li>
                </ul>
              </div>

              {/* Partial Refund Scenarios */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="w-5 h-5 text-accent-yellow" />
                  <h4 className="text-lg font-medium text-accent-yellow">50% Refund Available</h4>
                </div>
                <ul className="list-disc list-inside space-y-2 ml-8 text-neutral-300">
                  <li>Cancellation between 12-24 hours before scheduled session</li>
                  <li>Session interrupted due to technical issues beyond 30 minutes</li>
                  <li>Therapist unavailability with less than 24 hours notice</li>
                </ul>
              </div>

              {/* No Refund Scenarios */}
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <h4 className="text-lg font-medium text-red-400">No Refund Available</h4>
                </div>
                <ul className="list-disc list-inside space-y-2 ml-8 text-neutral-300">
                  <li>Cancellation less than 12 hours before scheduled session</li>
                  <li>No-show for scheduled appointment</li>
                  <li>Session completed successfully</li>
                  <li>Dissatisfaction with therapy content or approach</li>
                  <li>Personal circumstances preventing attendance</li>
                </ul>
              </div>
            </section>

            {/* Refund Process */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">2. Refund Process</h3>
              <div className="space-y-6">
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-6">
                  <h4 className="text-lg font-medium text-white mb-4">How to Request a Refund</h4>
                  <ol className="list-decimal list-inside space-y-3 text-neutral-300">
                    <li>Contact our support team within 7 days of the session date</li>
                    <li>Provide your booking reference number</li>
                    <li>Explain the reason for the refund request</li>
                    <li>Include any relevant documentation or evidence</li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Processing Timeline</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-neutral-300">
                    <li><strong>Review:</strong> 1-2 business days</li>
                    <li><strong>Approval:</strong> Email notification sent</li>
                    <li><strong>Processing:</strong> 3-5 business days</li>
                    <li><strong>Refund:</strong> Appears in original payment method within 7-10 business days</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Emergency Cancellations */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">3. Emergency Cancellations</h3>
              <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-accent-orange flex-shrink-0 mt-1" />
                  <div className="space-y-4 text-neutral-300">
                    <p>We understand that emergencies happen. In cases of:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Medical emergencies</li>
                      <li>Family emergencies</li>
                      <li>Natural disasters</li>
                      <li>Other unforeseen circumstances</li>
                    </ul>
                    <p>Please contact us immediately. We will review each case individually and may offer full refunds or session rescheduling at our discretion.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Method Specific */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">4. Payment Method Considerations</h3>
              <div className="space-y-4 text-neutral-300">
                <div>
                  <h4 className="text-lg font-medium text-primary-500 mb-3">Credit/Debit Cards</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Refunds processed to original card</li>
                    <li>May take 7-10 business days to appear</li>
                    <li>Bank processing times may vary</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-primary-500 mb-3">Mobile Wallets</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Refunds to original wallet account</li>
                    <li>Usually processed within 3-5 business days</li>
                    <li>Instant refunds for some wallet providers</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-primary-500 mb-3">Bank Transfers</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Refunds to original bank account</li>
                    <li>May require additional verification</li>
                    <li>Processing time: 5-7 business days</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">5. Dispute Resolution</h3>
              <div className="space-y-4 text-neutral-300">
                <p>If you disagree with a refund decision:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Contact our customer service team</li>
                  <li>Provide additional information or documentation</li>
                  <li>Request escalation to management</li>
                  <li>If unresolved, you may contact relevant consumer protection authorities</li>
                </ol>
              </div>
            </section>

            {/* Therapist Cancellations */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">6. Therapist-Initiated Cancellations</h3>
              <div className="space-y-4 text-neutral-300">
                <p>When a therapist cancels:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You will receive immediate notification</li>
                  <li>Full refund is automatically processed</li>
                  <li>Alternative therapist options will be provided</li>
                  <li>Priority rebooking assistance available</li>
                </ul>
              </div>
            </section>

            {/* Contact for Refunds */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-6 h-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-white">Refund Support</h2>
              </div>
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-6">
                <p className="text-neutral-300 mb-4">
                  For refund requests or questions about this policy:
                </p>
                <div className="space-y-2 text-neutral-300">
                  <p><strong>Refund Team:</strong> refunds@kalm.lk</p>
                  <p><strong>Customer Support:</strong> support@kalm.lk</p>
                  <p><strong>Phone:</strong> +94 (76) 633 0360</p>
                  <p><strong>WhatsApp:</strong> +94 77 123 4567</p>
                  <p><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (Sri Lanka Time)</p>
                </div>
              </div>
            </section>

            {/* Important Notes */}
            <section>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Important Notes</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-300">
                  <li>Refunds are processed in Sri Lankan Rupees (LKR)</li>
                  <li>Currency conversion fees (if any) are not refundable</li>
                  <li>This policy applies to all session types (video, audio, chat)</li>
                  <li>Package deals and promotional offers may have different terms</li>
                  <li>We reserve the right to modify this policy with notice</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;