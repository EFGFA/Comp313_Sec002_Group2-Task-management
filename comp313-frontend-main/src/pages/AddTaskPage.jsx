import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, ListGroup } from "react-bootstrap";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import "./TaskForm.css"; 

function AddTaskPage({ }) {

  const [formData, setFormData] = useState({ title: "", text: "", assignedTo: [],  });
  const [employees, setEmployees] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [selectedEmployeeToAdd, setSelectedEmployeeToAdd] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("Token not found");
        return; 
      }
      try {
        const [employeeResponse, userInfoResponse] = await Promise.all([
          axios.get("http://localhost:8082/api/employees", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get("http://localhost:8082/api/user-info", { 
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
        ]);

        setEmployees(employeeResponse.data);
        setUserRole(userInfoResponse.data.type); 
      } catch (error) {
        console.error('Failed to fetch initial data: ', error);
      }
    };

    fetchData();
  }, [token]);

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
        status: "not started",
        assignedTo: formData.assignedTo,
      };
  
      await axios.post(
        "http://localhost:8082/api/tasks",
        payload,
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

  const getEmployeeName = (id) => employees.find(emp => emp._id === id)?.name || id;

  const availableEmployees = employees.filter(emp => !formData.assignedTo.includes(emp._id));

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

          <Button type="submit" className="task-button">
            Add Task
          </Button>
        </Form>
    </Layout>
  );
}

export default AddTaskPage;
