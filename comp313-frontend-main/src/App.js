import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext"; 
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import TaskPage from "./pages/TaskPage";
import AddTaskPage from "./pages/AddTaskPage";
import EditTaskPage from "./pages/EditTaskPage";
import AddUserPage from "./pages/AddUserPage";

function ProtectedRoute({ children }) {
  const { token } = useAuth(); 
  return token ? children : <Navigate to="/login" replace />;
}

function AppContent() {

  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} /> 

        <Route path="/tasks" element={<ProtectedRoute><TaskPage /></ProtectedRoute>} />
        <Route path="/tasks/add" element={<ProtectedRoute><AddTaskPage /></ProtectedRoute>} />
        <Route path="/tasks/edit/:id" element={<ProtectedRoute><EditTaskPage /></ProtectedRoute>} />
        <Route path="/addemmployee" element={<ProtectedRoute><AddUserPage /></ProtectedRoute>} /> 

      </Routes>
  );
}

function App() {

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;