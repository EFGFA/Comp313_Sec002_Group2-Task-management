import { PostModel } from "../models/post.js";

import { UserModel } from "../models/user.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized, no user found" });
    }

    const { title, text, status, assignedTo } = req.body;

    const validAssignedTo = Array.isArray(assignedTo) ? assignedTo : [];

    const task = new PostModel({
      title: title,
      text: text,
      status: status || "not started", 
      userId: req.user.id,
      assignedTo: validAssignedTo,
    });

    await task.save();
    const populatedTask = await PostModel.findById(task._id).populate('assignedTo', 'name email'); 
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Error creating task: " + error.message });
  }
};

// Get All Tasks
export const getAllTasks = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    let query;

    if (req.user.type === "Admin" || req.user.type === "User") {
      query = PostModel.find({ userId });
    } else {
      query = PostModel.find({ assignedTo: userId });
    }

    const validSortFields = ["title", "text", "assignedTo", "status", "createdAt"];
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
    const { title, text, status, assignedTo } = req.body;

    let taskToUpdateQuery;
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (text !== undefined) updateFields.text = text;
    if (status !== undefined) updateFields.status = status;
    if (assignedTo !== undefined) {
      updateFields.assignedTo = Array.isArray(assignedTo) ? assignedTo : [];
    }
    
    if (req.user && req.user.type === 'Admin') {
      taskToUpdateQuery = PostModel.findByIdAndUpdate(id, updateFields, { new: true });
    } else if (req.user) {
      taskToUpdateQuery = PostModel.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        updateFields,
        { new: true }
      );
    } else {
       return res.status(401).json({ error: "Authentication required" });
    }

    const updatedTask = await taskToUpdateQuery.populate('assignedTo', 'name email');

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
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
