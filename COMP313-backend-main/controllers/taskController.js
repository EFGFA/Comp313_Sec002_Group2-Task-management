import { PostModel } from "../models/post.js";

import { UserModel } from "../models/user.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized, no user found" });
    }

    const task = new PostModel({
      title: req.body.title,
      text: req.body.text,
      status: "not started",
      userId: req.user.id,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Error creating task: " + error.message });
  }
};

// Get All Tasks
export const getAllTasks = async (req, res) => {
  try {
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    let query;

    // ✅ All roles see all tasks
    query = PostModel.find();

    // Sorting logic
    const validSortFields = ["title", "status", "createdAt"];
    if (sortBy && validSortFields.includes(sortBy)) {
      query = query.sort({ [sortBy]: sortOrder });
    }

    const tasks = await query;
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tasks: " + error.message });
  }
};



// Get Task By ID
export const getTaskById = async (req, res) => {
  try {
    const task = await PostModel.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: "Error fetching task: " + error.message });
  }
};

// Update Task (Title, Text, and Status)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text, status } = req.body;

    const updatedTask = await PostModel.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { title, text, status },
      { new: true },
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Error updating task: " + error.message });
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
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const task = await PostModel.findOne({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    await PostModel.findByIdAndDelete(id);
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
    task.assignedTo.push(user._id);
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
