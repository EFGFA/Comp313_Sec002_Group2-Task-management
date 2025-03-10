import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import "./TaskForm.css"; 

function EditTaskPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    text: "",
    status: "not started",
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        setFormData({
          title: response.data.title,
          text: response.data.text,
          status: response.data.status,
        });
      } catch (error) {
        console.error("Failed to fetch task details:", error);
        alert("Failed to fetch task details.");
      }
    };

    fetchTask();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:8082/api/tasks/${id}`,
        {
          title: formData.title,
          text: formData.text,
          status: formData.status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Task updated successfully!");
      navigate("/tasks");
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task.");
    }
  };

  return (
    <Layout>
        <div className="task-header">
          <Link to="/tasks" className="back-button">←</Link>
          <h1 className="task-title">Edit Task</h1>
        </div>
        <Form onSubmit={handleSubmit} className="task-form">
          <Form.Group className="mb-3">
            <Form.Label className="form-label">Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
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
              value={formData.text}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label">Status</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange}>
              <option value="not started">Not Started</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" className="task-button">
            Save Changes
          </Button>
        </Form>
    </Layout>
  );
}

export default EditTaskPage;
