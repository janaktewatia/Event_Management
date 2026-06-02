import mongoose from "mongoose";

const appUserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    userTypeId: { type: String, default: "" },
    active: { type: Boolean, default: true },
    password: { type: String, default: "" },
    twoFactorSecret: { type: String, default: "" },
    twoFactorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("AppUser", appUserSchema);
