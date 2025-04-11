import React, { useState, useEffect } from "react";
import { Table, Form } from "react-bootstrap";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import axios from "axios";
import "./TaskPage.css";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [userId, setUserId] = useState("");
  const [employees, setEmployees] = useState([]);

  const fetchTasksAndUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, user may not be authenticated.");
        return;
      }

      const [tasksResponse, userResponse, employeeResponse] = await Promise.all([
        axios.get(`http://localhost:8082/api/tasks?sortBy=${sortBy}&sortOrder=${sortOrder}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get("http://localhost:8082/api/user-info", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get("http://localhost:8082/api/employees", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
      ]);

      setTasks(tasksResponse.data);
      setUserEmail(userResponse.data.email);
      setUserRole(userResponse.data.type);
      setUserId(userResponse.data.id);
      setEmployees(employeeResponse.data);
    } catch (error) {
      console.error("Error fetching tasks or user info:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchTasksAndUserInfo();
  }, [sortBy, sortOrder]);

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:8082/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. You may not have permission.");
    }
  };

  const handleSearch = () => {
    const input = document.getElementById("task-search");
    setSearchQuery(input.value);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8082/api/tasks/${taskId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const updatedTasks = tasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const toggleSort = (field) => {
    const order = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(order);
  };

  const getEmployeeNameById = (employeeId) => {
    const employee = employees.find(emp => emp._id === employeeId);
    return employee ? employee.name : "Unassigned";
  };
  const displayTasks = tasks.filter((task) => {
    if (!searchQuery) {
      return true;
    }
    return task.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

        {userRole === "Admin" && (
          <Link to="/addemmployee">
            <button className="add-employee-button">+ Add Employee</button>
          </Link>
        )}

        {userRole !== "Employee" && (
          <Link to="/tasks/add">
            <button className="add-task-button">+ Add New Task</button>
          </Link>
        )}
      </div>
      <div className="task-heading">Progressing Task</div>
      <Table striped bordered hover className={`task-table ${userRole === "Employee" ? "employee-table" : ""}`}>
        <thead>
          <tr>
            <th onClick={() => toggleSort("title")}>
              Title
              <img src="/assets/sort.ico" alt="Sort" className="sort-icon" />
            </th>
            <th onClick={() => toggleSort("text")}>
              Text
              <img src="/assets/sort.ico" alt="Sort" className="sort-icon" />
            </th>
            {userRole === "Admin" && (
              <th onClick={() => toggleSort("assignedTo")}>
                Assigned To
                <img src="/assets/sort.ico" alt="Sort" className="sort-icon" />
              </th>
            )}
            <th onClick={() => toggleSort("status")}>
              Status
              <img src="/assets/sort.ico" alt="Sort" className="sort-icon" />
            </th>
            {userRole !== "Employee" && (
              <th>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {displayTasks.filter(task => task.status !== "completed").map((task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.text}</td>
              {userRole === "Admin" && 
              <td>{task.assignedTo && task.assignedTo.length > 0
                    ? task.assignedTo.map(employeeId => getEmployeeNameById(employeeId)).join(', ')
                    : "Not Assigned"}
              </td>}
              <td>
                {userRole === "Employee" ? (
                  <Form.Select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    disabled={task.status === "completed"}
                    className={`status-select ${task.status.replace(" ", "-").toLowerCase()}`}
                  >
                    <option value="not started">Not Started</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                ) : (
                  <span className={`status-badge ${task.status.replace(" ", "-").toLowerCase()}`}>
                    {task.status.toUpperCase()}
                  </span>
                )}
              </td>

              {userRole !== "Employee" && (
              <td className="action-cell">
                  <>
                    <Link to={`/tasks/edit/${task._id}`}>
                      <img src="/assets/edit.ico" alt="Edit" className="action-icon" />
                    </Link>
                    <span className="icon-spacing"></span>
                    <img
                      src="/assets/delete.ico"
                      alt="Delete"
                      className="action-icon"
                      onClick={() => handleDelete(task._id)}
                      style={{ cursor: "pointer" }}
                    />
                  </>
              </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="task-heading">Completed Task</div>
      <Table striped bordered hover className={`task-table ${userRole === "Employee" ? "employee-table" : ""}`}>
        <thead>
          <tr>
            <th onClick={() => toggleSort("title")}>
              Title
              <img src="/assets/sort.ico" alt="Sort" className="sort-icon" />
            </th>
            <th onClick={() => toggleSort("text")}>
              Text
              <img src="/assets/sort.ico" alt="Sort" className="sort-icon" />
            </th>
            <th onClick={() => toggleSort("status")}>
              Status
              <img src="/assets/sort.ico" alt="Sort" className="sort-icon" />
            </th>
            {userRole !== "Employee" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {displayTasks.filter(task => task.status === "completed").map((task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.text}</td>
              <td>
                <span className={`status-badge ${task.status.replace(" ", "-").toLowerCase()}`}>
                  {task.status.toUpperCase()}
                </span>
              </td>
              {userRole !== "Employee" && (
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
                    style={{ cursor: "pointer" }}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>      
      </Table>
    </Layout>
  );
}

export default TaskPage;
