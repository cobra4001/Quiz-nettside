import React from "react"
import { Nav, Navbar } from 'react-bootstrap'


const NavBar: React.FC = () => {
  return (
    <Navbar expand="lg" fixed="top" bg="primary" variant="dark">
      <Nav className="mx-auto">
        <Navbar.Brand href="/HomePage">QuizTask</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav.Link href="/quizcreate">Create</Nav.Link>
            <Nav.Link href="/QuizTakingPage">Take</Nav.Link>
            <Nav.Link href="#">Grade</Nav.Link>
            <Nav.Link href="/LoginPage">Login</Nav.Link>
        </Navbar.Collapse>
      </Nav>
    </Navbar>
    
  );
};

export default NavBar;