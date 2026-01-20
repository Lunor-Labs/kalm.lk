import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

interface PayHereWebhookBody {
    merchant_id: string;
    order_id: string;
    payment_id: string;
    payhere_amount: string;
    payhere_currency: string;
    status_code: string;
    md5sig: string;
    custom_1?: string;
    custom_2?: string;
    method?: string;
    status_message?: string;
    card_holder_name?: string;
    card_expiry?: string;
    card_last_four_digits?: string;
}

export const payHereWebhook = onRequest(
    {
        cors: true, // PayHere needs to be able to POST here
    },
    async (req, res) => {
        // Only allow POST requests
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }

        try {
            const body = req.body as PayHereWebhookBody;
            const {
                merchant_id,
                order_id,
                payhere_amount,
                payhere_currency,
                status_code,
                md5sig,
                payment_id
            } = body;

            console.log(`Received webhook for order: ${order_id}, status: ${status_code}`);

            // 1. Verify Hash
            const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
            if (!merchantSecret) {
                console.error("PayHere merchant secret not configured");
                res.status(500).send("Internal Server Error");
                return;
            }

            const merchantSecretHash = crypto
                .createHash("md5")
                .update(merchantSecret)
                .digest("hex")
                .toUpperCase();

            const expectedHashString =
                merchant_id +
                order_id +
                payhere_amount +
                payhere_currency +
                status_code +
                merchantSecretHash;

            const expectedHash = crypto
                .createHash("md5")
                .update(expectedHashString)
                .digest("hex")
                .toUpperCase();

            if (md5sig !== expectedHash) {
                console.warn(`Invalid hash for order ${order_id}. Expected ${expectedHash}, got ${md5sig}`);
                res.status(400).send("Invalid Signature");
                return;
            }

            // 2. Handle Idempotency
            const logRef = db.collection("webhookLogs").doc(order_id);
            const logSnap = await logRef.get();
            if (logSnap.exists) {
                console.log(`Webhook for order ${order_id} already processed.`);
                res.status(200).send("OK (Duplicate)");
                return;
            }

            // 3. Check Status (2 = Success)
            if (status_code === "2") {
                // Retrieve pending booking data
                const pendingRef = db.collection("pendingPayments").doc(order_id);
                const pendingSnap = await pendingRef.get();

                if (!pendingSnap.exists) {
                    console.error(`Pending booking not found for order ${order_id}`);
                    res.status(404).send("Pending booking not found");
                    return;
                }

                const bookingData = pendingSnap.data();
                if (bookingData?.status === "completed") {
                    console.log(`Booking for order ${order_id} already marked as completed.`);
                    res.status(200).send("OK (Already Completed)");
                    return;
                }

                // 4. Create Session

                // Create Daily.co room for video/audio sessions
                let dailyRoomUrl = "";
                let dailyRoomName = "";

                const sessionType = bookingData?.sessionType || "video";
                if (sessionType === "video" || sessionType === "audio") {
                    try {
                        const dailyApiKey = process.env.DAILY_API_KEY;

                        if (dailyApiKey) {
                            const roomResponse = await fetch("https://api.daily.co/v1/rooms", {
                                method: "POST",
                                headers: {
                                    "Authorization": `Bearer ${dailyApiKey}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    name: `kalm-session-${bookingData?.therapistId}-${bookingData?.clientId}-${Date.now()}`,
                                    privacy: "private",
                                    properties: {
                                        start_video_off: true,
                                        start_audio_off: true,
                                        enable_chat: false,
                                        max_participants: 2,
                                        exp: Math.floor(new Date(bookingData?.scheduledTime.toDate()).getTime() / 1000) + (4 * 60 * 60),
                                    },
                                }),
                            });

                            if (roomResponse.ok) {
                                const roomData: any = await roomResponse.json();
                                dailyRoomUrl = roomData.url;
                                dailyRoomName = roomData.name;
                            } else {
                                console.warn("Failed to create Daily.co room:", await roomResponse.text());
                            }
                        }
                    } catch (dailyError) {
                        console.error("Error creating Daily.co room:", dailyError);
                    }
                }

                const sessionData = {
                    therapistId: bookingData?.therapistId,
                    clientId: bookingData?.clientId,
                    sessionType: sessionType,
                    status: "scheduled",
                    scheduledTime: bookingData?.scheduledTime,
                    duration: bookingData?.duration || 60,
                    bookingId: order_id,
                    dailyRoomUrl,
                    dailyRoomName,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    paymentStatus: "paid",
                    amount: parseFloat(payhere_amount),
                    currency: payhere_currency
                };

                const sessionRef = await db.collection("sessions").add(sessionData);
                const sessionId = sessionRef.id;

                // 5. Create Payment Record
                await db.collection("payments").add({
                    bookingId: order_id,
                    sessionId: sessionId,
                    clientId: bookingData?.clientId,
                    therapistId: bookingData?.therapistId,
                    amount: parseFloat(payhere_amount),
                    currency: payhere_currency,
                    paymentMethod: "payhere",
                    paymentStatus: "completed",
                    paymentId: payment_id,
                    orderId: order_id,
                    couponCode: bookingData?.couponCode || null,
                    discountAmount: bookingData?.discountAmount || 0,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                // 6. Update pending booking status
                await pendingRef.update({
                    status: "completed",
                    sessionId: sessionId,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // 7. Log success
                await logRef.set({
                    order_id,
                    payment_id,
                    status: "success",
                    processedAt: admin.firestore.FieldValue.serverTimestamp(),
                    body: body
                });

                console.log(`✅ Session ${sessionId} created for order ${order_id}`);
            } else {
                // Log other statuses (e.g. 0 = Pending, -1 = Cancelled, -2 = Failed, -3 = Chargedback)
                await logRef.set({
                    order_id,
                    payment_id,
                    status: "other",
                    payhere_status: status_code,
                    processedAt: admin.firestore.FieldValue.serverTimestamp(),
                    body: body
                });
                console.log(`Webhook received with status ${status_code} for order ${order_id}`);
            }

            res.status(200).send("OK");

        } catch (err: any) {
            console.error("❌ Error processing PayHere webhook:", err);
            res.status(500).send("Internal Server Error");
        }
    }
);
