import { Router } from "express";
import EmiProfile from "../models/EmiProfile.js";
import EmiOrder from "../models/EmiOrder.js";

const router = Router();

// Save or update user KYC & financial details
router.post("/profile", async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      state = "",
      postalCode,
      pan,
      aadhar,
      bankAccountNo,
      bankIfsc,
      bankName = "",
      creditScore,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !postalCode ||
      !pan ||
      !aadhar ||
      !bankAccountNo ||
      !bankIfsc ||
      creditScore === undefined ||
      creditScore === null
    ) {
      return res.status(400).json({
        message:
          "All personal, KYC, banking, and credit score fields are required.",
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPan = String(pan).toUpperCase().trim();
    const cleanAadhar = String(aadhar).replace(/\s+/g, "").trim();
    const cleanBank = String(bankAccountNo).trim();
    const cleanIfsc = String(bankIfsc).toUpperCase().trim();
    const parsedScore = Number(creditScore);

    if (parsedScore < 300 || parsedScore > 900) {
      return res.status(400).json({
        message: "Credit score must be between 300 and 900.",
      });
    }

    const profileData = {
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: String(phone).trim(),
      address: String(address).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      postalCode: String(postalCode).trim(),
      pan: cleanPan,
      aadhar: cleanAadhar,
      bankAccountNo: cleanBank,
      bankIfsc: cleanIfsc,
      bankName: String(bankName).trim(),
      creditScore: parsedScore,
      isVerified: true,
    };

    // Find existing profile by email or create new (upsert)
    const profile = await EmiProfile.findOneAndUpdate(
      { email: cleanEmail },
      { $set: profileData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "EMI verification details saved successfully.",
      profile,
    });
  } catch (err) {
    next(err);
  }
});

// Get user profile by email (or latest)
router.get("/profile", async (req, res, next) => {
  try {
    const { email } = req.query;

    let profile = null;
    if (email) {
      profile = await EmiProfile.findOne({
        email: String(email).toLowerCase().trim(),
      });
    } else {
      // Return latest saved profile if available
      profile = await EmiProfile.findOne().sort({ updatedAt: -1 });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "No profile found.",
        profile: null,
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (err) {
    next(err);
  }
});

// Create and confirm a new EMI order
router.post("/orders", async (req, res, next) => {
  try {
    const { profile, items, subtotal, shipping = 0, total, plan } = req.body;

    if (!profile || !items || !plan) {
      return res.status(400).json({
        message: "Profile details, items, and EMI plan are required.",
      });
    }

    // Generate unique order reference ID: EMI-YYYYMMDD-XXXX
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const orderId = `EMI-${dateStr}-${randomHex}`;

    const newOrder = await EmiOrder.create({
      orderId,
      profile,
      items,
      subtotal: Number(subtotal),
      shipping: Number(shipping),
      total: Number(total),
      plan,
      status: "Confirmed",
      paymentStatus: "Pending Down Payment",
    });

    res.status(201).json({
      success: true,
      message: "EMI plan confirmed successfully!",
      order: newOrder,
    });
  } catch (err) {
    next(err);
  }
});

// Get EMI order details by orderId
router.get("/orders/:id", async (req, res, next) => {
  try {
    const order = await EmiOrder.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({ message: "EMI Order not found." });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

// List all EMI orders
router.get("/orders", async (_req, res, next) => {
  try {
    const orders = await EmiOrder.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
});

export default router;
