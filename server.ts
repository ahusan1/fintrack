import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

// Create Supabase Client for backend
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gbvglgjxfahbjlxvyfvt.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdidmdsZ2p4ZmFoYmpseHZ5ZnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDQ3MTAsImV4cCI6MjA5MzQ4MDcxMH0.P6fYvdlaF3ing_mnu8BgR3odi4cC-WjQ-L0lOhR-7fE';
const supabase = createClient(supabaseUrl, supabaseKey);
const SERVER_SECRET = 'server_api_secret_afin_2026';

let razorpayInstance: Razorpay | null = null;
let cachedKeyId: string | null = null;
let cachedKeySecret: string | null = null;

const fetchRazorpayKeys = async () => {
  if (cachedKeyId && cachedKeySecret) return true;

  try {
    const { data: idData, error: idErr } = await supabase.rpc('get_server_setting', {
      setting_key: 'razorpay_key_id',
      server_secret: SERVER_SECRET
    });
    
    const { data: secretData, error: secretErr } = await supabase.rpc('get_server_setting', {
      setting_key: 'razorpay_key_secret',
      server_secret: SERVER_SECRET
    });

    if (!idErr && !secretErr && idData && secretData) {
      cachedKeyId = idData;
      cachedKeySecret = secretData;
      return true;
    }
    
    // Fallback to env variables if unset in DB
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      cachedKeyId = process.env.RAZORPAY_KEY_ID;
      cachedKeySecret = process.env.RAZORPAY_KEY_SECRET;
      return true;
    }
  } catch (err) {
    console.error("Error fetching razorpay keys", err);
  }
  return false;
};

const getRazorpay = async () => {
  await fetchRazorpayKeys();

  if (!cachedKeyId || !cachedKeySecret) {
    throw new Error("Razorpay keys are not configured. Please set them in the Admin Panel.");
  }
  
  if (!razorpayInstance || (razorpayInstance as any).key_id !== cachedKeyId) {
    razorpayInstance = new Razorpay({
      key_id: cachedKeyId,
      key_secret: cachedKeySecret,
    });
  }
  return razorpayInstance;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Request to refresh Razorpay settings
  app.post("/api/razorpay/refresh-keys", async (req, res) => {
    cachedKeyId = null;
    cachedKeySecret = null;
    razorpayInstance = null;
    const success = await fetchRazorpayKeys();
    res.json({ success });
  });

  // Create Razorpay Order
  app.post("/api/razorpay/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt = "receipt#1" } = req.body;
      
      const rzp = await getRazorpay();
      const options = {
        amount: amount * 100, // amount in the smallest currency unit (paise for INR)
        currency,
        receipt,
      };

      const order = await rzp.orders.create(options);
      res.json({ ...order, key_id: cachedKeyId }); // Sending key_id to client
    } catch (error: any) {
      console.error("Razorpay order error:", error);
      res.status(500).json({ error: error.message || "Failed to create order" });
    }
  });

  // Verify Razorpay Signature (Usually webhook, but can also be called directly on success to fulfill server-side)
  app.post("/api/razorpay/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      await fetchRazorpayKeys();
      if (!cachedKeySecret) {
        throw new Error("RAZORPAY_KEY_SECRET is not configured");
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", cachedKeySecret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
      }
    } catch (error: any) {
      console.error("Signature verification error:", error);
      res.status(500).json({ error: error.message || "Verification failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support React Router fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
