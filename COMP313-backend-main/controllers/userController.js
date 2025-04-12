import { UserModel } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, type } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      type,
    });
    await user.save();
    res.status(200).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, type } = req.body; // Add type here
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credential!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credential!" });
    }

    if (user.type !== type) {
      return res.status(400).json({ message: "User type mismatch!" });
    }

    const token = jwt.sign(
      { id: user._id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false });
    res.status(200).json({
      message: "Login Successful",
      id: user._id,
      type: user.type,
      token,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};


export const getAllEmployee = async (req, res) => {
  try {
    if (!req.user || req.user.type !== 'Admin') {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  const users = await UserModel.find({ type: "Employee" }).select('-password');

  res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password').lean();; // Ensure 'req.user.id' is set by the 'protect' middleware
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

