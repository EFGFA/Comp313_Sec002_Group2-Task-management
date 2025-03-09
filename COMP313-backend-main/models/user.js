import mongoose from "mongoose";

const User = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    type: { type: String, required: true, enum: ["User", "Admin"] },
  },
  { collection: "User" },
);

export const UserModel = mongoose.model("User", User);
