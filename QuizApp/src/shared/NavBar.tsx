import React from "react";
 import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (!user) {
      // User is not logged in, go to login page
      navigate("/LoginPage", { state: { from: "/quizcreate", message: "You have to login first" } });
    } else {
      // user is logged in, go to Quiz create
      navigate("/quizcreate");
    }
  };

  console.log(user);
  return (
    /* This navbar is dynamic and changes based on whether user is logged in or not, it also collapses at smaller screen sizes
       making it responsive for mobile phones aswell*/
    <Navbar expand="lg" fixed="top" bg="success" variant="dark">
      <Container className={user ? "" : "justify-content-center"}>
        <Navbar.Brand href="/HomePage">
          <img
        src="src/img/Logo.png"
        width="30"
        height="30"
        className="d-inline-block align-top me-2"
        alt="Logo"
      />
      QuizApp
    </Navbar.Brand>
    <Navbar.Toggle 
        aria-controls="basic-navbar-nav" 
        className={!user ? "d-lg-none" : ""} 
    />
    
    <Navbar.Collapse 
        id="basic-navbar-nav"
        className={!user ? "flex-grow-0" : ""} 
    >
      {user ? (
        <>
          <Nav className="me-auto">
            <Nav.Link href="/QuizList">Quizzes</Nav.Link>
            <Nav.Link onClick={handleCreateClick} style={{ cursor: "pointer" }}>
              Create quiz
            </Nav.Link>
          </Nav>

          <Nav className="ms-auto">
            <NavDropdown title={user.unique_name} id="user-dropdown" align="end">
              <NavDropdown.Item>My scores</NavDropdown.Item>
              <NavDropdown.Item onClick={() => navigate("/MyQuizzes")}>
                My Quizzes
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  logout();
                  navigate("/", {
                    state: { message: "You have been logged out of the website." },
                  });
                }}
              >
                Logout
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => navigate("/UserProfile")}>
                Profile
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </>
      ) : (
        <Nav className="mx-auto text-center">
          <Nav.Link href="/QuizList">Quizzes</Nav.Link>
          <Nav.Link href="/CreateUser">Create account</Nav.Link>
          <Nav.Link
            onClick={() =>
              navigate("/LoginPage", {
                state: { from: "/NavBar", message: "" },
              })
            }
          >
            Login
          </Nav.Link>
        </Nav>
      )}
    </Navbar.Collapse>
  </Container>
</Navbar>
  );
};

export default NavBar;
