import { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", type: "User" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      alert("Registration successful. Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="register-header">
        <Link to="/" className="back-button">←</Link>
        <h1 className="register-title">Register</h1>
      </div>
      <Form onSubmit={handleSubmit} className="register-form">
        <Form.Group className="mb-3">
          <Form.Label className="form-label">Full Name</Form.Label>
          <Form.Control type="text" name="name" placeholder="Enter your full name" onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="form-label">Email</Form.Label>
          <Form.Control type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="form-label">Password</Form.Label>
          <Form.Control type="password" name="password" placeholder="Enter your password" onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3 user-type">
          <Form.Label className="form-label">User Type</Form.Label>
          <div className="radio-group">
            <Form.Check type="radio" label="Admin" name="type" value="Admin" onChange={handleChange} />
            <Form.Check type="radio" label="Individual" name="type" value="User" defaultChecked onChange={handleChange} />
          </div>
        </Form.Group>
        <Button type="submit" className="register-button">Register</Button>
      </Form>
    </Layout>
  );
}

export default RegisterPage;
