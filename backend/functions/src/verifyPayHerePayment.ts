import { onRequest, Request } from "firebase-functions/v2/https";
import * as dotenv from "dotenv";
import { Response } from "express";

// Load environment variables
dotenv.config();

export const verifyPayHerePayment = onRequest(
    {
        cors: [
            "https://lunor-labs.github.io",
            "https://www.kalm.lk",
            "http://localhost:5173",
            "http://localhost:3000",
            "https://kalmlk-dev.vercel.app",
            "https://kalm.lk",
        ]
    },
    async (req: Request, res: Response) => {
        // Only allow POST requests
        if (req.method !== "POST") {
            res.status(405).json({ error: "Method Not Allowed" });
            return;
        }

        try {
            const { orderId } = req.body;

            if (!orderId) {
                res.status(400).json({ error: "Missing required parameter: orderId" });
                return;
            }

            const appId = process.env.PAYHERE_APP_ID;
            const appSecret = process.env.PAYHERE_APP_SECRET;
            // const isSandbox = process.env.VITE_PAYHERE_SANDBOX === 'true'; // Note: backend might not have VITE_ envs, usually just NODE_ENV or custom. Assuming live unless specified.

            // Use sandbox URL if configured, but usually backend envs differ. 
            // I'll default to Live unless PAYHERE_ENV is 'sandbox'
            const payhereEnv = process.env.PAYHERE_ENV || 'production';
            const baseUrl = payhereEnv === 'sandbox'
                ? 'https://sandbox.payhere.lk'
                : 'https://www.payhere.lk';

            if (!appId || !appSecret) {
                console.error("PayHere App credentials not configured");
                res.status(500).json({ error: "Payment service configuration missing (App ID/Secret)" });
                return;
            }

            // 1. Get Auth Token
            const auth = Buffer.from(`${appId}:${appSecret}`).toString('base64');
            const tokenResponse = await fetch(`${baseUrl}/merchant/v1/oauth/token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'grant_type=client_credentials'
            });

            if (!tokenResponse.ok) {
                const err = await tokenResponse.text();
                console.error('PayHere Token Error:', err);
                // Return the actual error for debugging
                res.status(401).json({ error: "Failed to authenticate with PayHere", details: err });
                return;
            }

            const tokenData = await tokenResponse.json() as { access_token: string };
            const accessToken = tokenData.access_token;

            // 2. Get Payment Details
            const searchUrl = `${baseUrl}/merchant/v1/payment/search?order_id=${orderId}`;
            const searchResponse = await fetch(searchUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Referer': 'https://kalmlk-dev.vercel.app',
                }
            });

            if (!searchResponse.ok) {
                const err = await searchResponse.text();
                console.error('PayHere Search Error:', err);
                res.status(502).json({ error: "Failed to retrieve payment details", details: err });
                return;
            }

            const searchData = await searchResponse.json() as { status: number, msg: string, data?: any[] };

            // PayHere Search response structure:
            // { status: 1, msg: "Found", data: [ { order_id: "...", status: "RECEIVED", ... } ] }

            if (searchData.status === 1 && searchData.data && searchData.data.length > 0) {
                // Sort by LATEST payment for this order_id (if multiple attempts)
                // Usually order_id is unique per attempt in this system? 
                // Let's assume the first match or check status.
                const paymentRecord = searchData.data[0];
                const status = paymentRecord.status; // "RECEIVED", "SUCCESS", "FAILED" etc.

                // Map PayHere status to our boolean
                const isSuccess = status === "RECEIVED" || status === "SUCCESS" || status === "AUTHORIZED";

                res.status(200).json({
                    success: isSuccess,
                    status: status,
                    data: paymentRecord
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: "Order not found in PayHere",
                    details: searchData
                });
            }

        } catch (err: any) {
            console.error("❌ Error verifying PayHere payment:", err);
            res.status(500).json({ error: err.message || "Internal Server Error" });
        }
    }
);
