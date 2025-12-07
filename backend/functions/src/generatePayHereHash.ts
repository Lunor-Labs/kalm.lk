import { onRequest } from "firebase-functions/v2/https";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface GenerateHashRequest {
  orderId: string;
  amount: string;
  currency: string;
}

interface GenerateHashResponse {
  hash: string;
}

export const generatePayHereHash = onRequest(
  {
    cors: [
      "https://lunor-labs.github.io",
      "https://kalm.lk",
      "http://localhost:5173",
      "http://localhost:3000",
      "https://kalmlk-dev.vercel.app"
    ],
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      const { orderId, amount, currency } = req.body as GenerateHashRequest;
      
      // Validate required parameters
      if (!orderId || !amount || !currency) {
        res.status(400).json({ error: "Missing required parameters: orderId, amount, currency" });
        return;
      }

      // Get merchant credentials from environment
      const merchantId = process.env.PAYHERE_MERCHANT_ID;
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
      
      if (!merchantId || !merchantSecret) {
        console.error("PayHere merchant credentials not configured");
        res.status(500).json({ error: "Payment service not configured" });
        return;
      }

      // Generate MD5 hash of merchant secret
      const merchantSecretHash = crypto
        .createHash("md5")
        .update(merchantSecret)
        .digest("hex")
        .toUpperCase();

      // Create hash string: merchantId + orderId + amount + currency + merchantSecretHash
      const hashString = merchantId + orderId + amount + currency + merchantSecretHash;
      
      // Generate final MD5 hash
      const finalHash = crypto
        .createHash("md5")
        .update(hashString)
        .digest("hex")
        .toUpperCase();

      console.log(`✅ Generated hash for order: ${orderId}`);

      const response: GenerateHashResponse = { hash: finalHash };
      res.status(200).json(response);

    } catch (err: any) {
      console.error("❌ Error generating PayHere hash:", err);
      res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  }
);
