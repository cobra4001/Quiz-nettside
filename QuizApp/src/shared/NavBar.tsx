import React from "react";
import { Nav, Navbar } from 'react-bootstrap';
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (!user) {
      // Bruker er ikke logget inn – send til login med redirect info
      navigate("/LoginPage", { state: { from: "/quizcreate", message: "You have to login first" } });
    } else {
      // Bruker er logget inn – gå til quizcreate
      navigate("/quizcreate");
    }
  };

  return (
    <Navbar expand="lg" fixed="top" bg="primary" variant="dark">
      <Nav className="mx-auto">
        <Navbar.Brand href="/HomePage">QuizTask</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav.Link onClick={handleCreateClick} style={{ cursor: 'pointer' }}>Create</Nav.Link>
            <Nav.Link href="/QuizList">Quizzes</Nav.Link>
            {!user ? (
              <Nav.Link href="/LoginPage">Login</Nav.Link>
            ) : (
              <Nav.Link onClick={() => { logout(); navigate("/"); }}>Logout</Nav.Link>

            )}
        </Navbar.Collapse>
      </Nav>
    </Navbar>
  );
};

export default NavBar;
