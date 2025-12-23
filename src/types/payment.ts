export interface Payment {
  id: string; // Firestore document ID
  // Sequential integer IDs for easy tracking
  clientIdInt?: number; // Sequential client ID
  therapistIdInt?: number; // Sequential therapist ID
  bookingIdInt?: number; // Sequential booking ID
  paymentIdInt?: number; // Sequential payment ID
  // Original string IDs (for backward compatibility)
  bookingId: string;
  clientId: string;
  therapistId: string;
  clientName?: string;
  therapistName?: string;
  amount: number;
  currency: 'LKR';
  paymentMethod: 'payhere';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string; // PayHere payment ID
  orderId: string;
  merchantId?: string;
  hash?: string;
  couponCode?: string;
  discountAmount?: number;
  finalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  // Admin payout tracking
  payoutStatus: 'pending' | 'scheduled' | 'paid';
  payoutDate?: Date;
  therapistPayoutAmount?: number;
}

export interface PayHerePayment {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: 'LKR';
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: 'Sri Lanka';
}

export interface PayHereResponse {
  payment_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  custom_1?: string;
  custom_2?: string;
  method: string;
  status_message: string;
  card_holder_name?: string;
  card_no?: string;
}