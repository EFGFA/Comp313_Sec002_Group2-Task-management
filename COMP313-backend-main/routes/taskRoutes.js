import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createTask,
  deleteTask,
  getAllTasks,
  updateTaskStatus,
  assignUserToTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.route("/tasks").post(protect, createTask);
router.route("/tasks/:id").delete(protect, deleteTask);
router.route("/tasks").get(getAllTasks);
router.route("/tasks/:id/status").put(protect, updateTaskStatus);
router.route("/tasks/assign").put(protect, assignUserToTask);

export default router;
