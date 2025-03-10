import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import TaskPage from "./pages/TaskPage";
import AddTaskPage from "./pages/AddTaskPage";
import EditTaskPage from "./pages/EditTaskPage";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ id: payload.id, type: payload.type });

        localStorage.setItem("user", JSON.stringify({ id: payload.id, type: payload.type }));
      } catch (error) {
        console.error("Invalid token", error);
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/tasks" element={user ? <TaskPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/tasks/add" element={user ? <AddTaskPage /> : <Navigate to="/login" />} />
        <Route path="/tasks/edit/:id" element={user ? <EditTaskPage /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
