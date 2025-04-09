import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  assignUserToTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.route("/tasks").post(protect, createTask);
router.route("/tasks/assign").put(protect, assignUserToTask);
router.route("/tasks/:id").delete(protect, deleteTask);
router.route("/tasks").get(protect, getAllTasks);
router.route("/tasks/:id").get(protect, getTaskById);
router.route("/tasks/:id").put(protect, updateTask);
router.route("/tasks/:id/status").put(protect, updateTaskStatus);

export default router;
