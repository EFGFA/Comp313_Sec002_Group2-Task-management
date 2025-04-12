import { Container } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";
import Logout from "./Logout";
import { useAuth } from "../context/AuthContext"; 

function Layout({ children }) {
  const location = useLocation();
  const { token } = useAuth(); 

  const isTaskPage = location.pathname === "/tasks";

  return (
    <div className="layout">
      <header className="header">
        <div className="logo-container">
          <Link to="/">
            <img src="/assets/logo.png" alt="Logo" className="logo" />
          </Link>
        </div>
        {token && (
          <div style={{ marginTop: '20px', marginLeft: '90%' }}>
            <Logout />
          </div>
        )}
      </header>
      <main className={`content ${isTaskPage ? "task-page" : ""}`}>
        <Container className="white-box">{children}</Container>
      </main>
      <footer className="footer">© 2025 TaskWithMe Inc. All Right Reserved</footer>
    </div>
  );
}

export default Layout;