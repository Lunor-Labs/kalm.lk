import * as functions from "firebase-functions";
import * as crypto from "crypto";
import cors from "cors";

const corsHandler = cors({ origin: true }); // allow all origins, or replace true with an array of allowed origins

interface GenerateHashRequest {
  orderId: string;
  amount: string;
  currency: string;
}

interface GenerateHashResponse {
  hash: string;
}

export const generatePayHereHash = functions.https.onRequest((req, res) => {
  // Wrap everything inside corsHandler
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { orderId, amount, currency } = req.body as GenerateHashRequest;
      if (!orderId || !amount || !currency) {
        res.status(400).send("Missing required parameters");
        return;
      }

      const merchantId = process.env.PAYHERE_MERCHANT_ID!;
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
      if (!merchantId || !merchantSecret) {
        throw new Error("Merchant credentials not set");
      }

      // Generate hash
      const merchantSecretHash = crypto
        .createHash("md5")
        .update(merchantSecret)
        .digest("hex")
        .toUpperCase();

      const hashString = merchantId + orderId + amount + currency + merchantSecretHash;
      const finalHash = crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();

      const response: GenerateHashResponse = { hash: finalHash };
      res.json(response);

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });
});
