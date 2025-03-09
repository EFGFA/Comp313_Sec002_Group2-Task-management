import { PostModel } from "../models/post.js";

import { UserModel } from "../models/user.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    const task = new PostModel(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Error creating task: " + error.message });
  }
};

// Get All Tasks
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await PostModel.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tasks: " + error.message });
  }
};

// Update Task Status
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["in progress", "not started", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedTask = await PostModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating task status: " + error.message });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PostModel.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting task: " + error.message });
  }
};

// Assign User to Task (Admin only)
export const assignUserToTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body; // Task ID and User ID from the body

    // Check if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the task exists
    const task = await PostModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Assign the user to the task
    task.user = userId;
    await task.save();

    res
      .status(200)
      .json({ message: "User assigned to task successfully", task });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error assigning user to task: " + error.message });
  }
};
