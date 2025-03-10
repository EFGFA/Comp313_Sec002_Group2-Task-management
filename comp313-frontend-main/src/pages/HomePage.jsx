import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import Layout from "../components/Layout";
import "./HomePage.css";

function HomePage() {
  return (
    <Layout>
      <img src="../assets/register.png" alt="Register" className="register-image" />
      <div className="button-group">
        <Link to="/register">
          <Button variant="primary" className="m-2">Register</Button>
        </Link>
        <Link to="/login">
          <Button variant="success" className="m-2">Login</Button>
        </Link>
      </div>
    </Layout>
  );
}

export default HomePage;
