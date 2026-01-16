// PayHere payment gateway integration for Sri Lanka
import { PayHerePayment } from '../types/payment';

// Helper function to get Cloud Functions URL based on current environment
const getCloudFunctionsUrl = (functionName: string): string => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kalm-dev-907c9';
  return `https://us-central1-${projectId}.cloudfunctions.net/${functionName}`;
};

declare global {
  interface Window {
    payhere: {
      startPayment: (payment: PayHerePayment) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}

export interface PayHerePaymentData {
  amount: number;
  currency: 'LKR';
  orderId: string;
  items: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: 'Sri Lanka';
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryCountry?: 'Sri Lanka';
  custom1?: string;
  custom2?: string;
}

export interface PayHereResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  error?: string;
}

// Load PayHere script dynamically
const loadPayHereScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if PayHere is already loaded
    if (window.payhere) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = import.meta.env.VITE_PAYHERE_SANDBOX === 'true'
      ? 'https://www.payhere.lk/lib/payhere.js'
      : 'https://www.payhere.lk/lib/payhere.js';
    script.async = true;

    script.onload = () => {
      if (window.payhere) {
        resolve();
      } else {
        reject(new Error('PayHere failed to load'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load PayHere script'));
    };

    document.head.appendChild(script);
  });
};

// New: Fetch hash from server
const fetchPayHereHash = async (orderId: string, amount: number, currency: string) => {
  const response = await fetch(getCloudFunctionsUrl('generatePayHereHash'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      amount: amount.toFixed(2),
      currency
    })
  });

  const data = await response.json();
  if (!data.hash) throw new Error('Failed to get hash from server');
  return data.hash;
};



// Helper to verify payment via backend
const verifyPaymentStatus = async (orderId: string): Promise<boolean> => {
  try {
    const response = await fetch(getCloudFunctionsUrl('verifyPayHerePayment'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });

    if (!response.ok) {
      console.warn('Payment verification endpoint returned error, falling back to client status');
      // If verification fails due to server error (e.g. 500), we might want to fail safe or fail hard.
      // User asked to "check actual payment status", implying we should trust the server.
      // If server is 404, it means payment DEFINITELY didn't happen.
      if (response.status === 404) return false;
      // If 500, lets assume true if we got onCompleted? No, unsafe.
      // Let's return false to be safe, or throw?
      // Let's assume false if verification fails.
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.error('Payment verification network failed:', err);
    return false;
  }
};

export const initiatePayHerePayment = async (paymentData: PayHerePaymentData): Promise<PayHereResult> => {
  try {
    // Load PayHere script
    await loadPayHereScript();

    // Get configuration from environment variables
    const merchantId = import.meta.env.VITE_PAYHERE_MERCHANT_ID;
    const merchantSecret = import.meta.env.VITE_PAYHERE_MERCHANT_SECRET;
    const returnUrl = import.meta.env.VITE_PAYHERE_RETURN_URL || `${window.location.origin}/payment/success`;
    const cancelUrl = import.meta.env.VITE_PAYHERE_CANCEL_URL || `${window.location.origin}/payment/cancel`;
    const notifyUrl = import.meta.env.VITE_PAYHERE_NOTIFY_URL || `${window.location.origin}/api/payhere-webhook`;

    if (!merchantId || !merchantSecret) {
      throw new Error('PayHere configuration is missing. Please check environment variables.');
    }

    // Fetch secure hash from server
    const hash = await fetchPayHereHash(paymentData.orderId, paymentData.amount, paymentData.currency);
    // Payment hash for verification (only logged in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Payment hash generated:', hash);
    }

    // Prepare PayHere payment object
    const payment: PayHerePayment = {
      merchant_id: merchantId,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      order_id: paymentData.orderId,
      items: paymentData.items,
      amount: paymentData.amount.toFixed(2),
      currency: paymentData.currency,
      hash: hash,
      first_name: paymentData.firstName,
      last_name: paymentData.lastName,
      email: paymentData.email,
      phone: paymentData.phone,
      address: paymentData.address,
      city: paymentData.city,
      country: paymentData.country
    };

    // Add optional fields if provided
    if (paymentData.deliveryAddress) {
      (payment as any).delivery_address = paymentData.deliveryAddress;
    }
    if (paymentData.deliveryCity) {
      (payment as any).delivery_city = paymentData.deliveryCity;
    }
    if (paymentData.deliveryCountry) {
      (payment as any).delivery_country = paymentData.deliveryCountry;
    }
    if (paymentData.custom1) {
      (payment as any).custom_1 = paymentData.custom1;
    }
    if (paymentData.custom2) {
      (payment as any).custom_2 = paymentData.custom2;
    }

    return new Promise((resolve) => {
      // Set up PayHere callbacks
      window.payhere.onCompleted = async function (orderId: string) {
        if (isSettled) return;

        console.log('Payment completed. Order ID:', orderId);

        // Basic validation
        if (!orderId || (paymentData.orderId && orderId !== paymentData.orderId)) {
          console.error('Order ID mismatch or missing');
          isSettled = true;
          cleanup();
          resolve({
            success: false,
            error: 'Payment validation failed: Order ID mismatch'
          });
          return;
        }

        // Backend Verification
        try {
          const verified = await verifyPaymentStatus(orderId);
          if (!verified) {
            console.error('Backend verification failed for order:', orderId);
            isSettled = true;
            cleanup();
            resolve({
              success: false,
              error: 'Payment verification failed. Please contact support if you were charged.'
            });
            return;
          }
        } catch (e) {
          console.error('Verification error:', e);
          // Decide if we should block or allow? Safe to block if we want "Actual Status".
          // If network fails, we can't verify.
          isSettled = true;
          cleanup();
          resolve({
            success: false,
            error: 'Payment verification failed due to network error.'
          });
          return;
        }

        isSettled = true;
        cleanup();
        resolve({
          success: true,
          orderId: orderId,
          paymentId: orderId
        });
      };

      window.payhere.onDismissed = function () {
        console.log('Payment dismissed');
        resolve({
          success: false,
          error: 'Payment was cancelled by user'
        });
      };

      window.payhere.onError = function (error: string) {
        console.error('Payment error:', error);
        resolve({
          success: false,
          error: error || 'Payment failed'
        });
      };

      // Start the payment
      window.payhere.startPayment(payment);
    });

  } catch (error: any) {
    console.error('PayHere initialization error:', error);
    return {
      success: false,
      error: error.message || 'Failed to initialize payment'
    };
  }
};