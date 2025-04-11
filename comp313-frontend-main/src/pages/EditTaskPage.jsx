import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Form, Button, ListGroup } from "react-bootstrap";
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
    assignedTo: [],
  });
  const [employees, setEmployees] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [selectedEmployeeToAdd, setSelectedEmployeeToAdd] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
          console.error("Token not found");
          return;
      }
    try {
      const [taskResponse, employeeResponse, userInfoResponse] = await Promise.all([
        axios.get(`http://localhost:8082/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }),
        axios.get("http://localhost:8082/api/employees", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
         axios.get("http://localhost:8082/api/user-info", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
      ]);

      setFormData({
        title: taskResponse.data.title,
        text: taskResponse.data.text,
        status: taskResponse.data.status,
        assignedTo: taskResponse.data.assignedTo || [],
      });
      setEmployees(employeeResponse.data);
      setUserRole(userInfoResponse.data.type);

    } catch (error) {
      console.error("Failed to fetch initial data for edit:", error);
    }
  };

  fetchData();
}, [id, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmployeeSelectionChange = (e) => {
    setSelectedEmployeeToAdd(e.target.value);
  };

  const handleAddEmployee = () => {
    if (selectedEmployeeToAdd && !formData.assignedTo.includes(selectedEmployeeToAdd)) {
      setFormData(prevState => ({
        ...prevState,
        assignedTo: [...prevState.assignedTo, selectedEmployeeToAdd]
      }));
      setSelectedEmployeeToAdd("");
    }
  };

  const handleRemoveEmployee = (employeeIdToRemove) => {
    setFormData(prevState => ({
      ...prevState,
      assignedTo: prevState.assignedTo.filter(empId => empId !== employeeIdToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        text: formData.text,
        status: formData.status,
        assignedTo: formData.assignedTo,
      };
  
      await axios.put(
        `http://localhost:8082/api/tasks/${id}`,
        payload,
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

  const getEmployeeName = (id) => employees.find(emp => emp._id === id)?.name || id;

  const availableEmployees = employees.filter(emp => !formData.assignedTo.includes(emp._id));

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
          {userRole === 'Admin' && (
          <Form.Group className="mb-3">
          <Form.Label className="form-label">Assign Employees</Form.Label>
          <div className="d-flex mb-2">
            <Form.Select
              value={selectedEmployeeToAdd}
              onChange={handleEmployeeSelectionChange}
              className="me-2"
            >
              <option value="">Select employee to add...</option>
              {availableEmployees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </Form.Select>
            <Button variant="outline-secondary" onClick={handleAddEmployee} disabled={!selectedEmployeeToAdd}>
              Add
            </Button>
          </div>

          <div>
            <strong>Currently Assigned:</strong>
            {formData.assignedTo.length === 0 ? (
              <p className="text-muted ms-1 mt-1">None</p>
            ) : (
              <ListGroup horizontal className="flex-wrap mt-1">
                {formData.assignedTo.map(empId => (
                  <ListGroup.Item key={empId} className="d-flex justify-content-between align-items-center p-1 px-2 me-1 mb-1 rounded">
                    {getEmployeeName(empId)}
                    <Button
                      variant="close"
                      size="sm"
                      onClick={() => handleRemoveEmployee(empId)}
                      aria-label="Remove"
                      className="ms-2"
                    ></Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </Form.Group>
          )}
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
