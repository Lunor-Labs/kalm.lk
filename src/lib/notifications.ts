import * as firestore from 'firebase/firestore';
import { db } from './firebase';
import { format, subMinutes } from 'date-fns';

export interface NotificationSettings {
  therapistId: string;
  emailNotifications: {
    enabled: boolean;
    sessionReminders: boolean;
    newBookings: boolean;
    cancellations: boolean;
    hoursBeforeSession: number;
  };
  smsNotifications: {
    enabled: boolean;
    sessionReminders: boolean;
    newBookings: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  type: 'session_reminder' | 'new_booking' | 'cancellation' | 'rescheduled';
  sessionId?: string;
  scheduledFor: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
  createdAt: Date;
}

export const saveNotificationSettings = async (
  therapistId: string,
  settings: Omit<NotificationSettings, 'therapistId' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  try {
    const docRef = firestore.doc(db, 'notificationSettings', therapistId);
    
    // Use setDoc with merge to create or update the document
    await firestore.setDoc(docRef, {
      therapistId,
      ...settings,
      updatedAt: firestore.serverTimestamp(),
    }, { merge: true });
  } catch (error: any) {
    console.error('Error saving notification settings:', error);
    throw new Error(error.message || 'Failed to save notification settings');
  }
};

export const getNotificationSettings = async (therapistId: string): Promise<NotificationSettings | null> => {
  try {
    const docRef = firestore.doc(db, 'notificationSettings', therapistId);
    const docSnap = await firestore.getDoc(docRef);

    if (!docSnap.exists()) {
      // Return default settings
      return {
        therapistId,
        emailNotifications: {
          enabled: true,
          sessionReminders: true,
          newBookings: true,
          cancellations: true,
          hoursBeforeSession: 24,
        },
        smsNotifications: {
          enabled: false,
          sessionReminders: false,
          newBookings: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as NotificationSettings;
  } catch (error: any) {
    console.error('Error getting notification settings:', error);
    throw new Error(error.message || 'Failed to get notification settings');
  }
};

export const scheduleSessionReminder = async (
  sessionId: string,
  therapistEmail: string,
  therapistName: string,
  sessionDate: Date,
  hoursBeforeSession: number = 24
): Promise<void> => {
  try {
  // support fractional hours (e.g. 0.25 = 15 minutes) by converting to minutes
  const minutes = Math.round(hoursBeforeSession * 60);
  const reminderTime = subMinutes(sessionDate, minutes);
    
    // Don't schedule if the reminder time is in the past
    if (reminderTime <= new Date()) {
      console.log('Reminder time is in the past, skipping scheduling');
      return;
    }

    const emailNotification: Omit<EmailNotification, 'id'> = {
      recipientEmail: therapistEmail,
      recipientName: therapistName,
      subject: 'Session Reminder - Upcoming Therapy Session',
      body: generateSessionReminderEmail(therapistName, sessionDate),
      type: 'session_reminder',
      sessionId,
      scheduledFor: reminderTime,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date(),
    };

    await firestore.addDoc(firestore.collection(db, 'emailNotifications'), {
      ...emailNotification,
      createdAt: firestore.serverTimestamp(),
    });

    console.log(`Session reminder scheduled for ${format(reminderTime, 'PPpp')}`);
  } catch (error: any) {
    console.error('Error scheduling session reminder:', error);
    throw new Error(error.message || 'Failed to schedule session reminder');
  }
};

export const scheduleNewBookingNotification = async (
  therapistEmail: string,
  therapistName: string,
  sessionDate: Date,
  clientName: string = 'Anonymous Client'
): Promise<void> => {
  try {
    const emailNotification: Omit<EmailNotification, 'id'> = {
      recipientEmail: therapistEmail,
      recipientName: therapistName,
      subject: 'New Booking - Session Scheduled',
      body: generateNewBookingEmail(therapistName, sessionDate, clientName),
      type: 'new_booking',
      scheduledFor: new Date(), // Send immediately
      status: 'pending',
      retryCount: 0,
      createdAt: new Date(),
    };

    await firestore.addDoc(firestore.collection(db, 'emailNotifications'), {
      ...emailNotification,
      createdAt: firestore.serverTimestamp(),
    });

    console.log('New booking notification scheduled');
  } catch (error: any) {
    console.error('Error scheduling new booking notification:', error);
    throw new Error(error.message || 'Failed to schedule new booking notification');
  }
};

export const scheduleCancellationNotification = async (
  therapistEmail: string,
  therapistName: string,
  sessionDate: Date,
  reason: string = 'No reason provided'
): Promise<void> => {
  try {
    const emailNotification: Omit<EmailNotification, 'id'> = {
      recipientEmail: therapistEmail,
      recipientName: therapistName,
      subject: 'Session Cancelled - Booking Update',
      body: generateCancellationEmail(therapistName, sessionDate, reason),
      type: 'cancellation',
      scheduledFor: new Date(), // Send immediately
      status: 'pending',
      retryCount: 0,
      createdAt: new Date(),
    };

    await firestore.addDoc(firestore.collection(db, 'emailNotifications'), {
      ...emailNotification,
      createdAt: firestore.serverTimestamp(),
    });

    console.log('Cancellation notification scheduled');
  } catch (error: any) {
    console.error('Error scheduling cancellation notification:', error);
    throw new Error(error.message || 'Failed to schedule cancellation notification');
  }
};

export const getPendingNotifications = async (): Promise<EmailNotification[]> => {
  try {
    const q = firestore.query(
      firestore.collection(db, 'emailNotifications'),
      firestore.where('status', '==', 'pending'),
      firestore.where('scheduledFor', '<=', new Date())
    );

    const querySnapshot = await firestore.getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledFor: doc.data().scheduledFor?.toDate() || new Date(),
      sentAt: doc.data().sentAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as EmailNotification[];
  } catch (error: any) {
    console.error('Error getting pending notifications:', error);
    throw new Error(error.message || 'Failed to get pending notifications');
  }
};

export const markNotificationAsSent = async (notificationId: string): Promise<void> => {
  try {
    const docRef = firestore.doc(db, 'emailNotifications', notificationId);
    await firestore.updateDoc(docRef, {
      status: 'sent',
      sentAt: firestore.serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error marking notification as sent:', error);
    throw new Error(error.message || 'Failed to mark notification as sent');
  }
};

export const markNotificationAsFailed = async (notificationId: string, retryCount: number): Promise<void> => {
  try {
    const docRef = firestore.doc(db, 'emailNotifications', notificationId);
    await firestore.updateDoc(docRef, {
      status: retryCount >= 3 ? 'failed' : 'pending',
      retryCount,
    });
  } catch (error: any) {
    console.error('Error marking notification as failed:', error);
    throw new Error(error.message || 'Failed to mark notification as failed');
  }
};

// Email template generators
const generateSessionReminderEmail = (therapistName: string, sessionDate: Date): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #00BFA5; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Session Reminder</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${therapistName},</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          This is a friendly reminder that you have an upcoming therapy session scheduled for:
        </p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00BFA5;">
          <h3 style="color: #00BFA5; margin: 0 0 10px 0;">Session Details</h3>
          <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> ${format(sessionDate, 'EEEE, MMMM d, yyyy')}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Time:</strong> ${format(sessionDate, 'h:mm a')}</p>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Please ensure you're prepared and available for your session. You can access your session room through the Kalm therapist portal.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://kalm.lk/therapist/sessions" style="background-color: #00BFA5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Go to Sessions
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
          This is an automated reminder from Kalm. If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
};

const generateNewBookingEmail = (therapistName: string, sessionDate: Date, clientName: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #00BFA5; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Booking Received</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${therapistName},</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Great news! You have received a new session booking from a client.
        </p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00BFA5;">
          <h3 style="color: #00BFA5; margin: 0 0 10px 0;">Booking Details</h3>
          <p style="margin: 5px 0; color: #333;"><strong>Client:</strong> ${clientName}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> ${format(sessionDate, 'EEEE, MMMM d, yyyy')}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Time:</strong> ${format(sessionDate, 'h:mm a')}</p>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Please review the booking details and prepare for the upcoming session. You can manage all your bookings through the therapist portal.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://kalm.lk/therapist/schedule" style="background-color: #00BFA5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Schedule
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
          This is an automated notification from Kalm. If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
};

const generateCancellationEmail = (therapistName: string, sessionDate: Date, reason: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #FF7043; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Session Cancelled</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${therapistName},</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          We wanted to inform you that a session has been cancelled.
        </p>
        
        <div style="background-color: #fff3f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF7043;">
          <h3 style="color: #FF7043; margin: 0 0 10px 0;">Cancelled Session</h3>
          <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> ${format(sessionDate, 'EEEE, MMMM d, yyyy')}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Time:</strong> ${format(sessionDate, 'h:mm a')}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Reason:</strong> ${reason}</p>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          This time slot is now available for new bookings. You can view your updated schedule in the therapist portal.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://kalm.lk/therapist/schedule" style="background-color: #00BFA5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Schedule
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
          This is an automated notification from Kalm. If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
};