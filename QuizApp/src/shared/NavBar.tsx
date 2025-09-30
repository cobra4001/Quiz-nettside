import React from "react"
import { Nav, Navbar } from 'react-bootstrap'
import { useAuth } from "../auth/AuthContext";

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Navbar expand="lg" fixed="top" bg="primary" variant="dark">
      <Nav className="mx-auto">
        <Navbar.Brand href="/HomePage">QuizTask</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav.Link href="/quizcreate">Create</Nav.Link>
            <Nav.Link href="/QuizList">List</Nav.Link>
            <Nav.Link href="/QuizTakingPage">Take</Nav.Link>
            {!user ? (
              <Nav.Link href="/LoginPage">Login</Nav.Link>
            ) : (
              <Nav.Link onClick={logout}>Logout</Nav.Link>
            )}
            
        </Navbar.Collapse>
      </Nav>
    </Navbar>
    
  );
};

export default NavBar;