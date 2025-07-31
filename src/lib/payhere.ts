// PayHere payment gateway integration for Sri Lanka
import { PayHerePayment, PayHereResponse } from '../types/payment';
import MD5 from 'crypto-js/md5';

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

const generateHash = (
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  merchantSecret: string
): string => {
  const merchantSecretHash = MD5(merchantSecret).toString().toUpperCase();
  const hashString = `${merchantId}${orderId}${amount}${currency}${merchantSecretHash}`;
  const finalHash = MD5(hashString).toString().toUpperCase();
  return finalHash;
};

console.log(generateHash)
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

    // Generate hash
    const hash = generateHash(
      merchantId,
      paymentData.orderId,
      paymentData.amount.toFixed(2),
      paymentData.currency,
      merchantSecret
    );

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

// Verify payment on the server side (this would typically be a Cloud Function)
export const verifyPayHerePayment = async (paymentData: PayHereResponse): Promise<boolean> => {
  try {
    // In a real implementation, this would be done on your server
    // to verify the payment with PayHere's API
    
    const merchantSecret = import.meta.env.VITE_PAYHERE_MERCHANT_SECRET;
    if (!merchantSecret) {
      throw new Error('Merchant secret not configured');
    }

    // Verify the MD5 signature
    const localMd5sig = generateHash(
      paymentData.payment_id,
      paymentData.payhere_amount,
      paymentData.payhere_currency,
      paymentData.status_code,
      merchantSecret
    );

    return localMd5sig === paymentData.md5sig;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

// Helper function to format amount for PayHere
export const formatAmountForPayHere = (amount: number): string => {
  return amount.toFixed(2);
};

// Helper function to generate unique order ID
export const generateOrderId = (prefix: string = 'kalm'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
};