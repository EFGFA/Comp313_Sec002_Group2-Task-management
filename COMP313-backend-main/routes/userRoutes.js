import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  getAllEmplyee,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.route("/getAllEmplyee").get(protect, getAllEmplyee);

export default router;
