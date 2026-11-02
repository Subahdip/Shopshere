import mongoose from "mongoose";

const emiOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    profile: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      postalCode: { type: String, required: true },
      pan: { type: String, required: true },
      aadhar: { type: String, required: true },
      bankAccountNo: { type: String, required: true },
      bankIfsc: { type: String, required: true },
      bankName: { type: String, default: "" },
      creditScore: { type: Number, required: true },
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        size: { type: String, default: "" },
      },
    ],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    plan: {
      productPrice: { type: Number, required: true },
      downPercent: { type: Number, required: true },
      downPayment: { type: Number, required: true },
      principal: { type: Number, required: true },
      tenure: { type: Number, required: true },
      annualRate: { type: Number, required: true },
      monthlyEMI: { type: Number, required: true },
      totalInterest: { type: Number, required: true },
      totalPayable: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["Confirmed", "Pending", "Approved", "Cancelled"],
      default: "Confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending Down Payment", "Paid", "Active"],
      default: "Pending Down Payment",
    },
  },
  { timestamps: true }
);

export default mongoose.model("EmiOrder", emiOrderSchema);
