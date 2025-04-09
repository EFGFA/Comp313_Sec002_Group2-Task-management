import React, { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import "./AddUserPage.css"; 

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "Employee", 
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await registerUser(formData);

              alert("Employee added successfully!");
      navigate("/tasks");  
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register user");
    }
  };

  return (
    <Layout>
        
      <div className="add-user-header">
         <Link to="/tasks" className="back-button">←</Link>

        <h1 className="add-user-title">Add New Employee</h1>
      </div>
      <Form onSubmit={handleSubmit} className="add-user-form">
        <Form.Group className="mb-3">
          <Form.Label className="form-label">Full Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter employee's full name"
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="form-label">Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter employee's email"
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="form-label">Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Button type="submit" className="add-user-button">
          Register Employee
        </Button>
      </Form>
    </Layout>
  );
};

export default AddUserPage;
