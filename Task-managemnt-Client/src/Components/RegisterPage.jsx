import React, { useState } from 'react';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    type: 'user',
  });
  const [showLoading, setShowLoading] = useState(false);
  const apiUrl = '/api/register';

  const saveUser = async (e) => {
    e.preventDefault();
    setShowLoading(true);
    
    const data = {
      name: user.name,
      email: user.email,
      password: user.password,
      type: user.type,
    };

    try {
      const result = await axios.post(apiUrl, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setShowLoading(false);
      alert(result.data.message);
      navigate('/login'); // Redirect to login page after successful registration
    } catch (error) {
      setShowLoading(false);
      alert(error.response?.data?.message || 'Something went wrong');
    }
  };

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div>
      {showLoading && (
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      )}
      <Form onSubmit={saveUser}>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            id="name"
            placeholder="Enter name"
            value={user.name}
            onChange={onChange}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>User Type</Form.Label>
          <Form.Control
            as="select"
            name="type"
            value={user.type}
            onChange={onChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Form.Control>
        </Form.Group>

        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            id="email"
            placeholder="Enter email"
            value={user.email}
            onChange={onChange}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            id="password"
            placeholder="Enter password"
            value={user.password}
            onChange={onChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
    </div>
  );
};

export default RegisterPage;
