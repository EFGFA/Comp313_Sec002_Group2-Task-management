import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  getAllEmployee,
  getUserInfo,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.route("/employees").get(protect, getAllEmployee);
router.get("/user-info", protect, getUserInfo);


export default router;
