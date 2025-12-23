import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface ErrorLog {
  id?: string;
  message: string;
  stack?: string;
  userId?: string;
  userRole?: string;
  userAgent: string;
  url: string;
  timestamp: Date;
  environment: 'development' | 'production';
  errorType: 'auth' | 'payment' | 'storage' | 'network' | 'ui' | 'unknown';
  additionalData?: Record<string, any>;
}

class ErrorLogger {
  private isInitialized = false;

  private async ensureInitialized() {
    if (!this.isInitialized) {
      // Ensure we have proper permissions to write to error logs
      this.isInitialized = true;
    }
  }

  /**
   * Log an error to Firestore (for production) and console (for development)
   */
  async logError(
    error: Error | string,
    options: {
      userId?: string;
      userRole?: string;
      errorType?: ErrorLog['errorType'];
      additionalData?: Record<string, any>;
    } = {}
  ) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const errorLog: Omit<ErrorLog, 'id'> = {
      message: errorMessage,
      stack: errorStack,
      userId: options.userId,
      userRole: options.userRole,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date(),
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      errorType: options.errorType || 'unknown',
      additionalData: options.additionalData,
    };

    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔥 Error logged:', errorLog);
      return;
    }

    // In production, log to Firestore and console (but not exposing sensitive details)
    try {
      await this.ensureInitialized();

      // Only log to Firestore in production for monitoring
      if (process.env.NODE_ENV === 'production') {
        const docRef = await addDoc(collection(db, 'error_logs'), {
          ...errorLog,
          timestamp: serverTimestamp(),
        });

        // Minimal console log for production (just indicates error was logged)
        console.log(`Error logged to monitoring system (ID: ${docRef.id})`);
      }
    } catch (loggingError) {
      // If logging fails, at least log to console as fallback
      console.error('Failed to log error to monitoring system:', loggingError);
      console.error('Original error:', errorLog);
    }
  }

  /**
   * Get recent error logs (admin function)
   */
  async getRecentErrors(limitCount: number = 50): Promise<ErrorLog[]> {
    try {
      const q = query(
        collection(db, 'error_logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ErrorLog[];
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
      return [];
    }
  }

  /**
   * Log user-facing errors (called from UI error handlers)
   */
  async logUserError(
    error: Error | string,
    context: {
      userId?: string;
      userRole?: string;
      action?: string;
      component?: string;
    } = {}
  ) {
    await this.logError(error, {
      userId: context.userId,
      userRole: context.userRole,
      errorType: 'ui',
      additionalData: {
        action: context.action,
        component: context.component,
        userFriendly: true,
      },
    });
  }

  /**
   * Log authentication errors
   */
  async logAuthError(
    error: Error | string,
    userId?: string
  ) {
    await this.logError(error, {
      userId,
      errorType: 'auth',
      additionalData: {
        authError: true,
      },
    });
  }

  /**
   * Log payment errors
   */
  async logPaymentError(
    error: Error | string,
    userId: string,
    amount?: number,
    paymentMethod?: string
  ) {
    await this.logError(error, {
      userId,
      errorType: 'payment',
      additionalData: {
        amount,
        paymentMethod,
        paymentError: true,
      },
    });
  }

  /**
   * Log network/storage errors
   */
  async logNetworkError(
    error: Error | string,
    userId?: string,
    operation?: string
  ) {
    await this.logError(error, {
      userId,
      errorType: 'network',
      additionalData: {
        operation,
        networkError: true,
      },
    });
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Helper function for quick error logging
export const logError = (error: Error | string, options?: Parameters<ErrorLogger['logError']>[1]) =>
  errorLogger.logError(error, options);

export const logUserError = (error: Error | string, context?: Parameters<ErrorLogger['logUserError']>[1]) =>
  errorLogger.logUserError(error, context);

export const logAuthError = (error: Error | string, userId?: string) =>
  errorLogger.logAuthError(error, userId);

export const logPaymentError = (
  error: Error | string,
  userId: string,
  amount?: number,
  paymentMethod?: string
) =>
  errorLogger.logPaymentError(error, userId, amount, paymentMethod);

export const logNetworkError = (error: Error | string, userId?: string, operation?: string) =>
  errorLogger.logNetworkError(error, userId, operation);
