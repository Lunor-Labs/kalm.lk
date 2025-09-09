import { onSchedule } from "firebase-functions/v2/scheduler";
import nodemailer from "nodemailer";

// Configure transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sessionReminder = onSchedule("every 15 minutes", async (event) => {
  try {
    // --- Hardcoded bookings for testing ---
    const bookings = [
      {
        email: "imdineshsandaru@gmail.com",
        datetime: "2025-09-09T04:54:00Z",
        subject: "Reminder: Your booking soon",
        text: "Hi Dinesh, just reminding you of your booking at 10:20 AM.",
      },
      {
        email: "imalkadhananja28@gmail.com",
        datetime: "2025-09-09T05:05:00Z",
        subject: "Reminder: Later session",
        text: "Hi Imalka, this is for your booking at 10:05 AM.",
      },
    ];

    const now = new Date();
    const cutoff = new Date(now.getTime() + 15 * 60000);

    const remindersToSend = bookings.filter((b) => {
      console.log("now:", now);
      console.log("cutoff:", cutoff);
      const bookingTime = new Date(b.datetime);
      console.log("bookingTime:", bookingTime);
      return bookingTime > now && bookingTime <= cutoff;
    });

    if (remindersToSend.length === 0) {
      console.log("No reminders due in the next 15 mins");
      return;
    }

    for (const reminder of remindersToSend) {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: reminder.email,
        subject: reminder.subject,
        text: reminder.text,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Sent reminder to ${reminder.email}`);
    }
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
});
