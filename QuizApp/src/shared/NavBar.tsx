import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown, Container, Offcanvas } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import './NavBar.css'
import { isAdmin } from "../utils/roleUtils";

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (path: string, state?: any) => {
  setShowOffcanvas(false);
  navigate(path, state);
  };


  const handleCreateClick = () => {
    if (!user) {
      // User is not logged in, go to login page
      handleNavigate("/LoginPage", { state: { from: "/quizcreate", message: "You have to login first" } });
    } else {
      // user is logged in, go to Quiz create
      handleNavigate("/quizcreate");
    }
  };

  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || document.body.getAttribute("data-bs-theme") === "dark";
  });

  useEffect(() => {
    // keep body theme in sync with state and save to localStorage
    document.body.setAttribute("data-bs-theme", isDark ? "dark" : "light");
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  
  useEffect(() => {
    const handleResize = () => {
      // Bootstrap lg breakpoint is 992px
      if (window.innerWidth >= 992) {
        setShowOffcanvas(false);
      }
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

        <Navbar.Toggle
          aria-controls={offcanvasId}
          className={!user ? "d-lg-none" : ""}
          onClick={() => setShowOffcanvas(true)}
        />

        <Navbar.Offcanvas
          id={offcanvasId}
          aria-labelledby={offcanvasLabel}
          placement="end"
          show={showOffcanvas}
          onHide={() => setShowOffcanvas(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={offcanvasLabel}>
              <Nav.Link href="/HomePage">
                <img
                  src="src/img/Logo.png"
                  width="35"
                  height="35"
                  className="d-inline-block align-top me-2"
                  alt="Logo"
                />
                QuizApp
              </Nav.Link>
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            {user ? (
              // User logged in view
              <>
                <Nav className="text-center">
                  <Nav.Link href="/QuizList">Quizzes</Nav.Link>
                  <Nav.Link onClick={handleCreateClick} style={{ cursor: "pointer" }}>
                    Create quiz
                  </Nav.Link>
                   {/*If the user is Admin, show UserControl page */}
                   {isAdmin(user) && (
                    <Nav.Link onClick={() => handleNavigate("/UserControl")}>
                      User Control
                    </Nav.Link>
                  )}
                </Nav>

                <div className="ms-auto form-check form-switch mt-2 align-self-center d-none d-lg-flex">
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
                {/* Desktop / large screens: show user dropdown inline */}
                <Nav className="text-center d-none d-lg-flex align-items-center">
                  <NavDropdown title={user.unique_name} id="user-dropdown">
                    <NavDropdown.Item onClick={() => handleNavigate("/MyScores")}>
                      My scores
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => handleNavigate("/MyQuizzes")}>
                      My Quizzes
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => handleNavigate("/UserProfile")}>
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item
                      onClick={() => {
                        logout();
                        handleNavigate("/", {
                          state: { message: "You have been logged out of the website." },
                        });
                      }}
                    >
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav>
                {/* Small screens: show user dropdown separately */}
                <Nav className="text-center d-lg-none">
                  <NavDropdown title={user.unique_name} id="user-dropdown" align="end">
                    <NavDropdown.Item onClick={() => handleNavigate("/MyScores")}>
                      My scores
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => handleNavigate("/MyQuizzes")}>
                      My Quizzes
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => handleNavigate("/UserProfile")}>
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item
                      onClick={() => {
                        logout();
                        handleNavigate("/", {
                          state: { message: "You have been logged out of the website." },
                        });
                      }}
                    >
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav>

                <div className="d-lg-none offcanvas-switch-row">
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
              // User not logged in view
              <>
                <Nav className="text-center">
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
                      handleNavigate("/LoginPage", {
                        state: { from: "/NavBar", message: "" },
                      })
                    }
                  >
                    Login
                  </Nav.Link>
                </Nav>

                {/* Small screens: show auth links + theme switch at bottom-right */}
                <Nav className="text-center d-lg-none">
                  <Nav.Link href="/CreateUser">Create account</Nav.Link>
                  <Nav.Link
                    onClick={() =>
                      handleNavigate("/LoginPage", {
                        state: { from: "/NavBar", message: "" },
                      })
                    }
                  >
                    Login
                  </Nav.Link>
                </Nav>

                <div className="d-lg-none offcanvas-switch-row">
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