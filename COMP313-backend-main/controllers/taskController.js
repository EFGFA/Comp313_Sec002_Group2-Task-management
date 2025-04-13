import { PostModel } from "../models/post.js";
import { UserModel } from "../models/user.js"; // 필요시 사용

const ALLOWED_STATUSES = ['not started', 'in progress', 'completed'];

export const createTask = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized, no user found" });
    }
    if (req.user.type === 'Employee') {
       return res.status(403).json({ message: "Forbidden: Employees cannot create tasks" });
    }

    const { title, text, status, assignedTo } = req.body;

    if (!title || !text) {
        return res.status(400).json({ message: "Title and text are required" });
    }

    const taskStatus = status || "not started";
    if (status && !ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Invalid status value. Allowed: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const validAssignedTo = Array.isArray(assignedTo) ? assignedTo : [];

    const task = new PostModel({
      title: title,
      text: text,
      status: taskStatus,
      userId: req.user.id,
      assignedTo: validAssignedTo,
    });

    await task.save();
    const populatedTask = await PostModel.findById(task._id).populate('assignedTo', 'name email');
    res.status(201).json(populatedTask);

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation failed: " + error.message });
    }
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Error creating task: " + error.message });
  }
};

// Get All Tasks
export const getAllTasks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const userType = req.user.type;

    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    let queryFilter = {};

    if (userType === "User") {
      queryFilter = {
        $or: [
          { userId: userId },
          { assignedTo: userId }
        ]
      };
    } else if (userType === "Employee") {
      queryFilter = { assignedTo: userId };
    } else if (userType === "Admin") {
      queryFilter = { userId: userId };
    }

    let query = PostModel.find(queryFilter)
                        .populate('userId', 'name email type')
                        .populate('assignedTo', 'name email type'); 

    const validSortFields = ["title", "text", "status", "createdAt"];
    if (sortBy && validSortFields.includes(sortBy)) {
      query = query.sort({ [sortBy]: sortOrder });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const tasks = await query; 
    res.status(200).json(tasks);

  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Error fetching tasks: " + error.message });
  }
};

// Get Task By ID
export const getTaskById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.type;

    const task = await PostModel.findById(id)
                               .populate('userId', 'name email type')
                               .populate('assignedTo', 'name email type');


    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const ownerId = task.userId ? task.userId._id.toString() : null;
    if (!ownerId) {
        console.error("Task owner ID (userId) is missing or not populated correctly.");
        return res.status(500).json({ error: "Internal server error: Task data integrity issue." });
    }
    const isOwner = ownerId === userId;

    const assignedIds = Array.isArray(task.assignedTo)
        ? task.assignedTo.map(assignedUser => assignedUser ? assignedUser._id.toString() : null).filter(id => id !== null)
        : [];
    const isAssigned = assignedIds.includes(userId);


    if (userType !== 'Admin' && !isOwner && !isAssigned) {
        return res.status(403).json({ error: "Forbidden: You do not have permission to view this task" });
    }

    res.status(200).json(task);

  } catch (error) {
    console.error("Error fetching task by ID:", error);
    if (error.name === 'CastError') {
        return res.status(400).json({ error: "Invalid task ID format" });
    }
    res.status(500).json({ error: "Error fetching task: " + error.message });
  }
};

// Update Task (General update)
export const updateTask = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { title, text, status, assignedTo } = req.body;
    const userId = req.user.id;
    const userType = req.user.type;

    const task = await PostModel.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!task.userId) {
         console.error("Task owner ID (userId) is missing.");
         return res.status(500).json({ error: "Internal server error: Task data integrity issue." });
    }

    if (userType !== 'Admin' && task.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden: You can only update your own tasks" });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (text !== undefined) updateFields.text = text;
    if (status !== undefined) {
        if (!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ error: `Invalid status value. Allowed: ${ALLOWED_STATUSES.join(', ')}` });
        }
        updateFields.status = status;
    }
    if (assignedTo !== undefined) {
      updateFields.assignedTo = Array.isArray(assignedTo) ? assignedTo : [];
    }

    const updatedTask = await PostModel.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true })
                                      .populate('assignedTo', 'name email')
                                      .populate('userId', 'name email type');

    res.status(200).json(updatedTask);

  } catch (error) {
    console.error("Error updating task:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation failed: " + error.message });
    }
    if (error.name === 'CastError') {
        return res.status(400).json({ error: "Invalid ID or assignedTo user ID format" });
    }
    res.status(500).json({ error: "Error updating task: " + error.message });
  }
};

// Update Task Status Only
export const updateTaskStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userType = req.user.type;

    if (!ALLOWED_STATUSES.includes(status)) { 
      return res.status(400).json({ error: `Invalid status value. Allowed: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const task = await PostModel.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!task.userId) {
         console.error("Task owner ID (userId) is missing.");
         return res.status(500).json({ error: "Internal server error: Task data integrity issue." });
    }

    const isOwner = task.userId.toString() === userId;
    const assignedIds = Array.isArray(task.assignedTo) ? task.assignedTo.map(assignedUser => assignedUser.toString()) : [];
    const isAssigned = assignedIds.includes(userId); 


    if (userType !== 'Admin' && !isOwner && !isAssigned) {
       return res.status(403).json({ error: "Forbidden: You cannot update status for this task" });
    }

    const updatedTask = await PostModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'name email type').populate('assignedTo', 'name email type');

    res.status(200).json(updatedTask);

  } catch (error) {
    console.error("Error updating task status:", error); 
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation failed: " + error.message });
    }
     if (error.name === 'CastError') {
        return res.status(400).json({ error: "Invalid task ID format" });
    }
    res.status(500).json({ error: "Error updating task status: " + error.message });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.type;

    const task = await PostModel.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!task.userId) {
         console.error("Task owner ID (userId) is missing.");
         return res.status(500).json({ error: "Internal server error: Task data integrity issue." });
    }

    if (userType !== 'Admin' && task.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden: You can only delete your own tasks" });
    }

    await PostModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Task deleted successfully" });

  } catch (error) {
    console.error("Error deleting task:", error);
     if (error.name === 'CastError') {
        return res.status(400).json({ error: "Invalid task ID format" });
    }
    res.status(500).json({ error: "Error deleting task: " + error.message });
  }
};