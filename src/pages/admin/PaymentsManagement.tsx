import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Payment } from '../../types/payment';
import { CreditCard, Search, Filter, Calendar, ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type PayoutStatus = Payment['payoutStatus'];

interface PaymentWithId extends Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentsManagement: React.FC = () => {
  const [payments, setPayments] = useState<PaymentWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [payoutFilter, setPayoutFilter] = useState<PayoutStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, payoutFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const rawPayments = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          bookingId: data.bookingId,
          clientId: data.clientId,
          therapistId: data.therapistId,
          // Sequential integer IDs
          clientIdInt: data.clientIdInt as number | undefined,
          therapistIdInt: data.therapistIdInt as number | undefined,
          bookingIdInt: data.bookingIdInt as number | undefined,
          paymentIdInt: data.paymentIdInt as number | undefined,
          clientName: data.clientName as string | undefined,
          therapistName: data.therapistName as string | undefined,
          amount: data.amount as number | undefined,
          currency: data.currency,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          paymentId: data.paymentId,
          orderId: data.orderId,
          merchantId: data.merchantId,
          hash: data.hash,
          couponCode: data.couponCode,
          discountAmount: data.discountAmount as number | undefined,
          finalAmount: data.finalAmount as number | undefined,
          payoutStatus: (data.payoutStatus || 'pending') as PayoutStatus,
          payoutDate: data.payoutDate ? data.payoutDate.toDate() : undefined,
          therapistPayoutAmount: data.therapistPayoutAmount as number | undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as PaymentWithId;
      });

      // Backfill names from users collection when missing, so we always show "Name (ID)"
      const missingClientIds = Array.from(
        new Set(
          rawPayments
            .filter((p) => !p.clientName && p.clientId)
            .map((p) => p.clientId),
        ),
      );
      const missingTherapistIds = Array.from(
        new Set(
          rawPayments
            .filter((p) => !p.therapistName && p.therapistId)
            .map((p) => p.therapistId),
        ),
      );

      const idToName: Record<string, string> = {};

      await Promise.all(
        [...missingClientIds, ...missingTherapistIds].map(async (uid) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              const uData = userDoc.data() as any;
              idToName[uid] = (uData.displayName as string) || (uData.email as string) || uid;
            }
          } catch (e) {
            // Ignore lookup errors; we'll just fall back to ID
          }
        }),
      );

      const paymentsData: PaymentWithId[] = rawPayments.map((p) => ({
        ...p,
        clientName: p.clientName || idToName[p.clientId] || p.clientId,
        therapistName: p.therapistName || idToName[p.therapistId] || p.therapistId,
      }));

      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutStatusChange = async (paymentId: string, newStatus: PayoutStatus) => {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        payoutStatus: newStatus,
        payoutDate: newStatus === 'paid' ? new Date() : null,
      });

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                payoutStatus: newStatus,
                payoutDate: newStatus === 'paid' ? new Date() : undefined,
              }
            : p,
        ),
      );

      toast.success(`Payout status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating payout status:', error);
      toast.error(error.message || 'Failed to update payout status');
    }
  };

  const filteredPayments = payments.filter((p) => {
    // Only show sessions that have actually received a completed payment
    const matchesStatus = p.paymentStatus === 'completed';
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      p.clientName?.toLowerCase().includes(searchLower) ||
      p.therapistName?.toLowerCase().includes(searchLower) ||
      p.clientId.toLowerCase().includes(searchLower) ||
      p.therapistId.toLowerCase().includes(searchLower) ||
      p.orderId.toLowerCase().includes(searchLower) ||
      (p.clientIdInt && p.clientIdInt.toString().includes(searchQuery)) ||
      (p.therapistIdInt && p.therapistIdInt.toString().includes(searchQuery)) ||
      (p.bookingIdInt && p.bookingIdInt.toString().includes(searchQuery)) ||
      (p.paymentIdInt && p.paymentIdInt.toString().includes(searchQuery));

    const matchesPayout = payoutFilter === 'all' || p.payoutStatus === payoutFilter;

    return matchesStatus && matchesSearch && matchesPayout;
  });

  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage) || 1;
  const startIndex = (currentPage - 1) * paymentsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + paymentsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount == null) return '-';
    return `LKR ${amount.toLocaleString()}`;
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Payments</h1>
          <p className="text-neutral-300 text-sm sm:text-base">Monitor all payments and manage therapist payouts</p>
        </div>

        <button
          onClick={loadPayments}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 text-sm"
        >
          <Clock className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center md:justify-between justify-center mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="md:text-left text-center">
            <h3 className="text-2xl font-bold text-white mb-1">
              {payments.filter((p) => p.paymentStatus === 'completed').length}
            </h3>
            <p className="text-neutral-400 text-sm mb-2">Completed Payments</p>
            <p className="text-accent-green text-sm">All time successful payments</p>
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center md:justify-between justify-center mb-4">
            <div className="w-12 h-12 bg-accent-yellow rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="md:text-left text-center">
            <h3 className="text-2xl font-bold text-white mb-1">
              {formatCurrency(
                payments
                  .filter((p) => p.paymentStatus === 'completed')
                  .reduce((sum, p) => sum + (p.finalAmount || p.amount || 0), 0),
              )}
            </h3>
            <p className="text-neutral-400 text-sm mb-2">Total Collected</p>
            <p className="text-accent-green text-sm">Gross revenue from sessions</p>
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center md:justify-between justify-center mb-4">
            <div className="w-12 h-12 bg-accent-green rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="md:text-left text-center">
            <h3 className="text-2xl font-bold text-white mb-1">
              {payments.filter((p) => p.payoutStatus === 'pending').length}
            </h3>
            <p className="text-neutral-400 text-sm mb-2">Pending Payouts</p>
            <p className="text-accent-green text-sm">Sessions to settle with therapists</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-primary-500/20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or integer ID (Client #, Therapist #, Booking #, Payment #)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <select
              value={payoutFilter}
              onChange={(e) => setPayoutFilter(e.target.value as PayoutStatus | 'all')}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none transition-all duration-200 bg-neutral-800 text-white text-sm"
            >
              <option value="all">All payout statuses</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <p className="text-neutral-400 text-xs sm:text-sm">
              Showing {paginatedPayments.length} of {filteredPayments.length} payments
            </p>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl border border-primary-500/30 overflow-hidden">
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Payment Records</h2>
            <div className="text-xs text-neutral-400">
              Showing integer IDs: Payment #, Booking #, Client #, Therapist #
            </div>
          </div>
        </div>

        {paginatedPayments.length === 0 ? (
          <div className="py-10 text-center">
            <CreditCard className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-300 text-base font-semibold mb-1">No payments found</p>
            <p className="text-neutral-400 text-sm">
              {searchQuery || payoutFilter !== 'all'
                ? 'Try adjusting your search or payout status filter'
                : 'Payments will appear here once clients complete bookings'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-800/60">
                <tr>
                  <th className="text-left p-3 text-neutral-300 font-medium">ID</th>
                  <th className="text-left p-3 text-neutral-300 font-medium">Date</th>
                  <th className="text-left p-3 text-neutral-300 font-medium">Client</th>
                  <th className="text-left p-3 text-neutral-300 font-medium">Therapist</th>
                  <th className="text-left p-3 text-neutral-300 font-medium">Session</th>
                  <th className="text-right p-3 text-neutral-300 font-medium">Amount</th>
                  <th className="text-left p-3 text-neutral-300 font-medium">Payment</th>
                  <th className="text-left p-3 text-neutral-300 font-medium">Payout</th>
                  <th className="text-left p-3 text-neutral-300 font-medium">Order ID</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p) => (
                  <tr key={p.id} className="border-t border-neutral-800 hover:bg-neutral-800/40">
                    <td className="p-3 text-neutral-200">
                      <div className="flex flex-col gap-1">
                        {p.paymentIdInt && (
                          <span className="font-semibold text-primary-500">Payment #{p.paymentIdInt}</span>
                        )}
                        {p.bookingIdInt && (
                          <span className="text-xs text-neutral-300">Booking #{p.bookingIdInt}</span>
                        )}
                        <span className="text-[10px] text-neutral-500 font-mono">Doc: {p.id.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-200">
                      <div className="flex flex-col">
                        <span>{format(p.createdAt, 'yyyy-MM-dd')}</span>
                        <span className="text-xs text-neutral-400">{format(p.createdAt, 'HH:mm')}</span>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-200">
                      <div className="flex flex-col">
                        <span className="font-medium">{p.clientName || p.clientId}</span>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          {p.clientIdInt && <span className="text-primary-400">Client #{p.clientIdInt}</span>}
                          <span>UID: {p.clientId.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-200">
                      <div className="flex flex-col">
                        <span className="font-medium">{p.therapistName || p.therapistId}</span>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          {p.therapistIdInt && <span className="text-accent-green">Therapist #{p.therapistIdInt}</span>}
                          <span>UID: {p.therapistId.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-200">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-neutral-800 text-xs text-neutral-200 capitalize">
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right text-neutral-200">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">
                          {formatCurrency(p.finalAmount || p.amount || 0)}
                        </span>
                        {p.discountAmount ? (
                          <span className="text-xs text-accent-green">
                            Discount: -{formatCurrency(p.discountAmount)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3 text-neutral-200">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-neutral-300 uppercase">{p.paymentMethod}</span>
                        {p.paymentId && (
                          <span className="text-xs text-neutral-400">Ref: {p.paymentId}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-neutral-200">
                      <select
                        value={p.payoutStatus}
                        onChange={(e) => handlePayoutStatusChange(p.id, e.target.value as PayoutStatus)}
                        className="text-xs bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="paid">Paid</option>
                      </select>
                      {p.payoutDate && (
                        <p className="mt-1 text-[10px] text-neutral-400">
                          Paid on {format(p.payoutDate, 'yyyy-MM-dd')}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-neutral-200">
                      <span className="text-xs text-neutral-300 break-all font-mono">{p.orderId}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginatedPayments.length > 0 && (
        <div className="flex items-center justify-between gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm min-h-[40px] ${
              currentPage === 1
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            } transition-colors duration-200`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <p className="text-neutral-400 text-xs sm:text-sm">
            Page {currentPage} of {totalPages}
          </p>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm min-h-[40px] ${
              currentPage === totalPages
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            } transition-colors duration-200`}
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagement;


