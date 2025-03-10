import { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import "./LoginPage.css";

function LoginPage({ setUser }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
  
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
  
      setUser(response.data);
      alert("Login successful!");
      navigate("/tasks");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password. Please try again.");
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
        <Button type="submit" className="login-button">Login</Button>
      </Form>
    </Layout>
  );
}

export default LoginPage;
