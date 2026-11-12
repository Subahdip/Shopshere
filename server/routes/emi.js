import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import EmiProfile from "../models/EmiProfile.js";
import EmiOrder from "../models/EmiOrder.js";

const router = Router();

// ---- File upload handling (PAN, Aadhaar, verification photo, other document) ----
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "emi");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) =>
      cb(null, `${file.fieldname}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ALLOWED_MIME[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME[file.mimetype]) {
      const err = new Error("Only JPG, PNG, WEBP or PDF files are allowed.");
      err.status = 400;
      return cb(err);
    }
    // The verification photo must be an image, not a PDF
    if (file.fieldname === "verificationPhoto" && file.mimetype === "application/pdf") {
      const err = new Error("Verification photo must be an image (JPG, PNG or WEBP).");
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

const uploadFields = upload.fields([
  { name: "panFile", maxCount: 1 },
  { name: "aadharFile", maxCount: 1 },
  { name: "verificationPhoto", maxCount: 1 },
  { name: "otherDocFile", maxCount: 1 },
]);

const OTHER_DOC_TYPES = [
  "Driving Licence",
  "Passport",
  "Voter ID",
  "Utility Bill",
  "Bank Statement",
  "Other",
];

const removeFiles = (files = {}) => {
  Object.values(files)
    .flat()
    .forEach((f) => fs.unlink(f.path, () => {}));
};

// Save or update user KYC & financial details
router.post("/profile", uploadFields, async (req, res, next) => {
  const files = req.files || {};
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
      removeFiles(files);
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
      removeFiles(files);
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

    // Existing profile (to reuse previously uploaded files / clean up replaced ones)
    const existing = await EmiProfile.findOne({ email: cleanEmail });

    // PAN, Aadhaar and verification photo are mandatory (new upload or already on file)
    const fileUrl = (field) =>
      files[field]?.[0] ? `/uploads/emi/${files[field][0].filename}` : existing?.[field] || "";

    const missing = [
      ["panFile", "PAN card file"],
      ["aadharFile", "Aadhaar card file"],
      ["verificationPhoto", "verification photo"],
    ]
      .filter(([f]) => !fileUrl(f))
      .map(([, label]) => label);
    if (missing.length) {
      removeFiles(files);
      return res.status(400).json({ message: `Please upload: ${missing.join(", ")}.` });
    }

    profileData.panFile = fileUrl("panFile");
    profileData.aadharFile = fileUrl("aadharFile");
    profileData.verificationPhoto = fileUrl("verificationPhoto");

    // Optional "other important document" - type + file go together
    const otherDocType = String(req.body.otherDocType || "").trim();
    const otherDocFile = fileUrl("otherDocFile");
    if (otherDocType && !OTHER_DOC_TYPES.includes(otherDocType)) {
      removeFiles(files);
      return res.status(400).json({ message: "Invalid document type selected." });
    }
    if (otherDocType && !otherDocFile) {
      removeFiles(files);
      return res.status(400).json({ message: "Please upload the file for the selected document type." });
    }
    profileData.otherDocType = otherDocFile ? otherDocType : "";
    profileData.otherDocFile = otherDocType ? otherDocFile : "";

    // Find existing profile by email or create new (upsert)
    const profile = await EmiProfile.findOneAndUpdate(
      { email: cleanEmail },
      { $set: profileData },
      { new: true, upsert: true, runValidators: true }
    );

    // Delete files that were replaced by new uploads
    ["panFile", "aadharFile", "verificationPhoto", "otherDocFile"].forEach((f) => {
      const old = existing?.[f];
      if (old && files[f]?.[0] && old !== profileData[f]) {
        fs.unlink(path.join(__dirname, "..", old), () => {});
      }
    });

    res.status(200).json({
      success: true,
      message: "EMI verification details saved successfully.",
      profile,
    });
  } catch (err) {
    removeFiles(files);
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