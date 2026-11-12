import mongoose from "mongoose";

const emiProfileSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "", trim: true },
    postalCode: { type: String, required: true, trim: true },
    pan: { type: String, required: true, uppercase: true, trim: true },
    aadhar: { type: String, required: true, trim: true },
    bankAccountNo: { type: String, required: true, trim: true },
    bankIfsc: { type: String, required: true, uppercase: true, trim: true },
    bankName: { type: String, default: "", trim: true },
    creditScore: {
      type: Number,
      required: true,
      min: 300,
      max: 900,
      default: 750,
    },
    // Uploaded document files (stored as public URL paths, e.g. /uploads/emi/xxx.pdf)
    panFile: { type: String, default: "" },
    aadharFile: { type: String, default: "" },
    verificationPhoto: { type: String, default: "" },
    otherDocType: { type: String, default: "", trim: true },
    otherDocFile: { type: String, default: "" },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("EmiProfile", emiProfileSchema);