import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown, Container, Offcanvas } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import './NavBar.css'

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

  const [isDark, setIsDark] = useState<boolean>(
    () => document.body.getAttribute("data-bs-theme") === "dark"
  );

  useEffect(() => {
    // keep body theme in sync with state
    document.body.setAttribute("data-bs-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const darkModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDark(e.target.checked);
  };

  console.log(user);

  const expand = "lg";
  const offcanvasId = `offcanvasNavbar-expand-${expand}`;
  const offcanvasLabel = `offcanvasNavbarLabel-expand-${expand}`;

  return (
    /* This navbar is dynamic and changes based on whether user is logged in or not, it also collapses at smaller screen sizes
       making it responsive for mobile phones aswell*/
    <Navbar expand={expand} fixed="top" bg="success" variant="dark">
      <Container className={user ? "" : "justify-content"}>
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

        <Navbar.Toggle aria-controls={offcanvasId} className={!user ? "d-lg-none" : ""} />

        <Navbar.Offcanvas
          id={offcanvasId}
          aria-labelledby={offcanvasLabel}
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={offcanvasLabel}>Menu</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            {user ? (
              <>
                <Nav className="me-auto text-center">
                  <Nav.Link href="/QuizList">Quizzes</Nav.Link>
                  <Nav.Link onClick={handleCreateClick} style={{ cursor: "pointer" }}>
                    Create quiz
                  </Nav.Link>
                </Nav>

                {/* Desktop / large screens: keep switch next to user menu */}
                <Nav className="ms-auto text-center d-none d-lg-flex align-items-center">
                  <div className="form-check form-switch mt-2 align-self-center">
                    <label className="theme-switch mx-2" aria-label="Toggle dark mode">
                      <input
                        type="checkbox"
                        id="darkModeToggle"
                        checked={isDark}
                        onChange={darkModeChange}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                  <NavDropdown title={user.unique_name} id="user-dropdown" align="end">
                    <NavDropdown.Item onClick={() => navigate("/MyScores")}>
                      My scores
                    </NavDropdown.Item>
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

                {/* Small screens: place the switch at the bottom-right (inside offcanvas) */}
                <div className="d-lg-none w-100 d-flex justify-content-end pb-3 px-3 offcanvas-switch-row">
                  <label className="theme-switch" aria-label="Toggle dark mode">
                    <input
                      type="checkbox"
                      id="darkModeToggle-sm"
                      checked={isDark}
                      onChange={darkModeChange}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </>
            ) : (
              <>
                <Nav className="me-auto text-center">
                  <Nav.Link href="/QuizList">Quizzes</Nav.Link>
                </Nav>

                {/* Desktop / large screens: switch visible inline with auth links */}
                <Nav className="ms-auto text-center d-none d-lg-flex align-items-center">
                  <div className="form-check form-switch mt-2 align-self-center">
                    <label className="theme-switch mx-2" aria-label="Toggle dark mode">
                      <input
                        type="checkbox"
                        id="darkModeToggle"
                        checked={isDark}
                        onChange={darkModeChange}
                      />
                      <span className="slider" />
                    </label>
                  </div>
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

                {/* Small screens: place the switch at the bottom-right (inside offcanvas) */}
                <div className="d-lg-none w-100 d-flex justify-content-end pb-3 px-3 offcanvas-switch-row">
                  <label className="theme-switch" aria-label="Toggle dark mode">
                    <input
                      type="checkbox"
                      id="darkModeToggle-sm"
                      checked={isDark}
                      onChange={darkModeChange}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </>
            )}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default NavBar;