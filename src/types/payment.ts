export interface Payment {
  id: string;
  bookingId: string;
  clientId: string;
  therapistId: string;
  amount: number;
  currency: 'LKR';
  paymentMethod: 'payhere';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string; // PayHere payment ID
  orderId: string;
  merchantId: string;
  hash: string;
  couponCode?: string;
  discountAmount?: number;
  finalAmount: number;
  createdAt: Date;
  updatedAt: Date;
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