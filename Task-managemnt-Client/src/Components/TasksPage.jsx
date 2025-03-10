import React, { useState } from 'react';
import { Button, Form, Card, Modal, Alert } from 'react-bootstrap';

const TaskManagementPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'not started' });
  const [editTask, setEditTask] = useState(null); // State for editing a task
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle adding a new task
  const handleAddTask = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const task = { ...newTask, id: tasks.length + 1 }; // Assign a unique ID
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '', status: 'not started' });
      setError('');
    } catch (err) {
      setError('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a task
  const handleEditTask = (taskId, updatedTask) => {
    setLoading(true);
    try {
      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
      setEditTask(null); // Close the edit modal
      setError('');
    } catch (err) {
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId) => {
    setLoading(true);
    try {
      setTasks(tasks.filter((task) => task.id !== taskId));
      setError('');
    } catch (err) {
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Task Management</h2>

      {/* Add Task Form */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleAddTask}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              >
                <option value="not started">Not Started</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>

            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Task'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tasks List */}
      {tasks.map((task) => (
        <Card key={task.id} className="mb-3">
          <Card.Body>
            <Card.Title>{task.title}</Card.Title>
            <Card.Text>{task.description}</Card.Text>
            <div className="d-flex justify-content-between align-items-center">
              <Form.Select
                value={task.status}
                onChange={(e) =>
                  handleEditTask(task.id, { ...task, status: e.target.value })
                }
                style={{ width: 'auto' }}
              >
                <option value="not started">Not Started</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
              <div>
                <Button
                  variant="warning"
                  onClick={() => setEditTask(task)} // Open edit modal
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteTask(task.id)} // Delete task
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}

      {/* Edit Task Modal */}
      <Modal show={!!editTask} onHide={() => setEditTask(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditTask(editTask.id, editTask);
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task title"
                value={editTask?.title || ''}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter task description"
                value={editTask?.description || ''}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                required
              />
            </Form.Group>

            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Task'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TaskManagementPage;
