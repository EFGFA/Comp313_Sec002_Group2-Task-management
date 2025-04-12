import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import Layout from "../components/Layout";
import "./HomePage.css";

function HomePage() {
  return (
    <Layout>
      <div className="home-box">
      <div className="button-group">
        <img
          src="../assets/register.png"
          alt="Register"
          className="register-image"
        />
        <Link to="/register">
          <Button variant="primary" className="m-2">
            Register
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="success" className="m-2">
            Login
          </Button>
        </Link>
      </div>
      </div>
    </Layout>
  );
}

export default HomePage;
