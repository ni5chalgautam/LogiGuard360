import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, index: true },
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["systemAdministrator", "warehouseManager", "logisticsStaff"],
      default: "logisticsStaff"
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

UserSchema.methods.toSafeJSON = function(){
  return {
    _id: this._id,
    userId: this.userId,
    username: this.username,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

export default mongoose.model("User", UserSchema);
