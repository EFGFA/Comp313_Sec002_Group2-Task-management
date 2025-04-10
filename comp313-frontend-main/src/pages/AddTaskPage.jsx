import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import "./TaskForm.css"; 

function AddTaskPage({ user }) {
  const [formData, setFormData] = useState({ title: "", text: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8082/api/tasks",
        {
          title: formData.title,
          text: formData.text,
          status: "not started",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      alert("Task added successfully!");
      navigate("/tasks");
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  return (
    <Layout>
        <div className="task-header">
          <Link to="/tasks" className="back-button">←</Link>
          <h1 className="task-title">Add New Task</h1>
        </div>
        <Form onSubmit={handleSubmit} className="task-form">
          <Form.Group className="mb-3">
            <Form.Label className="form-label">Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="Enter task title"
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label">Text</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="text"
              placeholder="Enter task details"
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button type="submit" className="task-button">
            Add Task
          </Button>
        </Form>
    </Layout>
  );
}

export default AddTaskPage;
