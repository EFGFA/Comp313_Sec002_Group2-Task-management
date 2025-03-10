import { useState, useEffect } from "react";
import { Table, Form } from "react-bootstrap";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import axios from "axios";
import "./TaskPage.css";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, user may not be authenticated.");
          return;
        }
  
        const response = await axios.get("http://localhost:8082/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
  
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error.response?.data || error.message);
      }
    };
  
    fetchTasks();
  }, []);
  
  

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
  
    const token = localStorage.getItem("token");
  
    try {
      await axios.delete(`http://localhost:8082/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true, 
      });
  
      setTasks(tasks.filter(task => task._id !== taskId)); 
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. You may not have permission.");
    }
  };
  
  const handleSearch = () => {
    const input = document.getElementById("task-search");
    setSearchQuery(input.value);
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="task-header">
        <h1 className="task-title">Tasks</h1>
        <div className="search-container">
          <Form.Control
            id="task-search"
            type="text"
            placeholder="Search by title..."
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <img
            src="/assets/search.ico"
            alt="Search"
            className="search-icon"
            onClick={handleSearch}
          />
        </div>
        <Link to="/tasks/add">
          <button className="add-task-button">+ Add New Task</button>
        </Link>
      </div>

      <Table striped bordered hover className="task-table">
        <thead>
          <tr>
            <th style={{ width: "20%" }}>Title</th>   
            <th style={{ width: "40%" }}>Text</th>    
            <th style={{ width: "20%" }}>Status</th>  
            <th style={{ width: "20%" }}>Actions</th> 
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.text}</td>
              <td>
                <span className={`status-badge ${task.status.replace(" ", "-").toLowerCase()}`}>
                  {task.status.toUpperCase()}
                </span>
              </td>
              <td className="action-cell">
                <Link to={`/tasks/edit/${task._id}`}>
                  <img src="/assets/edit.ico" alt="Edit" className="action-icon" />
                </Link>
                <span className="icon-spacing"></span>
                <img
                  src="/assets/delete.ico"
                  alt="Delete"
                  className="action-icon"
                  onClick={() => handleDelete(task._id)}
                  style={{ cursor: "pointer"}}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Layout>
  );
}

export default TaskPage;
