import React from "react";
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';

const NavMenu: React.FC = () => {
  return (
    <Navbar expand="lg">
      <Navbar.Brand href="/">QuizTask</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/XXXXX">Create</Nav.Link>
          <Nav.Link href="/XXXXX">Take</Nav.Link>
          <Nav.Link href="/XXXXX">Grade</Nav.Link>
        </Nav>
      </Navbar.Collapse>
  </Navbar>
  );
};

export default NavMenu;