import { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "./LoginPage.css";

function LoginPage({ setUser }) {
  const [formData, setFormData] = useState({ email: "", password: "", type: "User" });
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);

      setAuthData(response.data.token, response.data); 

      alert("Login successful!");
      navigate("/tasks");
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.response?.data?.message || "Invalid credentials.");
    }
  };

  return (
    <Layout>
      <div className="login-header">
        <Link to="/" className="back-button">←</Link>
        <h1 className="login-title">Login</h1>
      </div>
      <Form onSubmit={handleSubmit} className="login-form">
        <Form.Group className="mb-3">
          <Form.Label className="form-label">Email</Form.Label>
          <Form.Control type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="form-label">Password</Form.Label>
          <Form.Control type="password" name="password" placeholder="Enter your password" onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3 user-type">
          <Form.Label className="form-label">Login as</Form.Label>
          <div className="radio-group">
            <Form.Check type="radio" label="Admin" name="type" value="Admin" onChange={handleChange} />
            <Form.Check type="radio" label="Employee" name="type" value="Employee" onChange={handleChange} />
            <Form.Check type="radio" label="Individual" name="type" value="User" defaultChecked onChange={handleChange} />
          </div>
        </Form.Group>
        <Button type="submit" className="login-button">Login</Button>
      </Form>
    </Layout>
  );
}

export default LoginPage;
