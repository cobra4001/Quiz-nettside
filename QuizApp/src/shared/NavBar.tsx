import React from "react";
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
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

  console.log(user);

  return (
    <Navbar expand="lg" fixed="top" bg="success" variant="dark">
      <Nav className="mx-auto justify-content-between">
        <Navbar.Brand href="/HomePage">
          <img
            src="src/img/Logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top"/>
          {' QuizApp'}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            
            <Nav.Link href="/QuizList">Quizzes</Nav.Link>

            {!user ? <Nav.Link href="/CreateUser">Create account</Nav.Link> : <Nav.Link onClick={handleCreateClick} style={{ cursor: 'pointer' }}>Create quiz</Nav.Link> }

            {!user ? (
              <Nav.Link onClick={() => navigate("/LoginPage", { state: { from: "/NavBar", message: "" }})}>Login</Nav.Link>
            ) : (
              
              <NavDropdown title={user.unique_name} id="basic-nav-dropdown"> 
              <NavDropdown.Item>My scores</NavDropdown.Item> {/* Eventuel oppgradering til siden, hvor man kan se ens score */}
              <NavDropdown.Item onClick={() => navigate("/MyQuizzes")}>My Quizzes</NavDropdown.Item> {/* Navigerer til oversigt over ens egen quizzer */}
              <NavDropdown.Item onClick={() => { logout(); navigate("/", {state: { message: "You have been logged out of the website."}}); }}>Logout</NavDropdown.Item>
              <NavDropdown.Item onClick={() => navigate("/UserProfile")}>Profile</NavDropdown.Item>
              </NavDropdown>

            )}
        </Navbar.Collapse>
      </Nav>
    </Navbar>
  );
};

export default NavBar;
