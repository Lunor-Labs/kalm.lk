// PayHere payment gateway integration for Sri Lanka
import { PayHerePayment} from '../types/payment';

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
  const response = await fetch('https://us-central1-kalm-dev-907c9.cloudfunctions.net/generatePayHereHash', {
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
      window.payhere.onCompleted = function (orderId: string) {
        console.log('Payment completed. Order ID:', orderId);
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