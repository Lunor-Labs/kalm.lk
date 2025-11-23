import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

// Load environment variables from .env file (for local development)
dotenv.config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Configure transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Helper: Format date for email display
function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Generate HTML email template
function generateReminderEmail(
  recipientName: string,
  sessionDate: Date,
  sessionType: string,
  isTherapist: boolean
): string {
  const portalLink = isTherapist
    ? "https://kalm.lk/therapist/sessions"
    : "https://kalm.lk/client/sessions";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #00BFA5; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Session Reminder</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${recipientName},</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          This is a friendly reminder that you have an upcoming therapy session scheduled within the next hour.
        </p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00BFA5;">
          <h3 style="color: #00BFA5; margin: 0 0 10px 0;">Session Details</h3>
          <p style="margin: 5px 0; color: #333;"><strong>Date & Time:</strong> ${formatDateTime(sessionDate)}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Session Type:</strong> ${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}</p>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Please ensure you're prepared and available for your session. You can access your session room through the Kalm portal.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${portalLink}" style="background-color: #00BFA5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Go to Sessions
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
          This is an automated reminder from Kalm. If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
}

export const sessionReminder = onSchedule("every 15 minutes", async (event) => {
  try {
    console.log("🔔 Session reminder function started");

    const now = new Date();
    const reminderWindow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    console.log(`⏰ Checking for sessions between ${now.toISOString()} and ${reminderWindow.toISOString()}`);

    // Query sessions that are scheduled within the next hour and are in 'scheduled' status
    const sessionsSnapshot = await db
      .collection("sessions")
      .where("status", "==", "scheduled")
      .where("scheduledTime", ">=", now)
      .where("scheduledTime", "<=", reminderWindow)
      .get();

    if (sessionsSnapshot.empty) {
      console.log("✅ No sessions found in the next hour");
      return;
    }

    console.log(`📋 Found ${sessionsSnapshot.size} session(s) to send reminders for`);

    let sentCount = 0;
    let errorCount = 0;

    for (const sessionDoc of sessionsSnapshot.docs) {
      const sessionData = sessionDoc.data();
      const sessionId = sessionDoc.id;

      try {
        // Fetch therapist details
        const therapistDoc = await db.collection("users").doc(sessionData.therapistId).get();
        const therapistData = therapistDoc.data();

        // Fetch client details
        const clientDoc = await db.collection("users").doc(sessionData.clientId).get();
        const clientData = clientDoc.data();

        if (!therapistData || !clientData) {
          console.warn(`⚠️ Missing user data for session ${sessionId}`);
          continue;
        }

        const scheduledTime = sessionData.scheduledTime.toDate();
        const sessionType = sessionData.sessionType || "video";

        // Check if reminder was already sent
        const reminderDoc = await db.collection("sentReminders").doc(sessionId).get();

        if (reminderDoc.exists) {
          console.log(`⏭️ Reminder already sent for session ${sessionId}`);
          continue;
        }

        // Send reminder to therapist
        if (therapistData.email) {
          const therapistMailOptions = {
            from: process.env.GMAIL_USER,
            to: therapistData.email,
            subject: "Upcoming Session Reminder - Kalm",
            html: generateReminderEmail(
              therapistData.displayName || "Therapist",
              scheduledTime,
              sessionType,
              true
            ),
          };

          await transporter.sendMail(therapistMailOptions);
          console.log(`✉️ Sent reminder to therapist: ${therapistData.email}`);
          sentCount++;
        }

        // Send reminder to client
        if (clientData.email) {
          const clientMailOptions = {
            from: process.env.GMAIL_USER,
            to: clientData.email,
            subject: "Upcoming Session Reminder - Kalm",
            html: generateReminderEmail(
              clientData.displayName || "Client",
              scheduledTime,
              sessionType,
              false
            ),
          };

          await transporter.sendMail(clientMailOptions);
          console.log(`✉️ Sent reminder to client: ${clientData.email}`);
          sentCount++;
        }

        // Mark reminder as sent
        await db.collection("sentReminders").doc(sessionId).set({
          sessionId,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          therapistEmail: therapistData.email,
          clientEmail: clientData.email,
        });

        console.log(`✅ Successfully processed session ${sessionId}`);
      } catch (sessionError) {
        console.error(`❌ Error processing session ${sessionId}:`, sessionError);
        errorCount++;
      }
    }

    console.log(`📊 Summary: ${sentCount} reminders sent, ${errorCount} errors`);
  } catch (error) {
    console.error("❌ Error in session reminder function:", error);
  }
});
