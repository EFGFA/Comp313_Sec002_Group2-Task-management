import axios from "axios";

const API_URL = "http://localhost:8082/api";

export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

export const loginUser = async (formData) => {
    return axios.post(`${API_URL}/login`, formData, { withCredentials: true });
};

export const fetchTasks = async () => {
  return axios.get(`${API_URL}/tasks`, { withCredentials: true });
};

export const addTask = async (taskData) => {
  return axios.post(`${API_URL}/tasks`, taskData, { withCredentials: true });
};

export const updateTask = async (taskId, taskData) => {
  return axios.put(`${API_URL}/tasks/${taskId}`, taskData, { withCredentials: true });
};

export const deleteTask = async (taskId) => {
  return axios.delete(`${API_URL}/tasks/${taskId}`, { withCredentials: true });
};
