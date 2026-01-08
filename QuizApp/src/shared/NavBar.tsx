import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/roleUtils";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/img/file.svg";

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  const handleNavigate = (path: string, options?: { state?: any; replace?: boolean }) => {
    setShowMobileMenu(false);
    navigate(path, options);
  };

  const handleCreateClick = () => {
    if (!user) {
      handleNavigate("/LoginPage", {
        state: { from: "/quizcreate", message: "You have to login first" },
      });
    } else {
      handleNavigate("/quizcreate");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="fixed z-50 border-b navbar-gradient text-navbar-foreground rounded-full top-4 right-25 left-25 shadow-lg border border-navbar-foreground">
      <div className="container mx-auto px-4 lg:px-4">
        <div className="flex items-center h-16">
          {/* Logo and Brand */}
          <a
            href="/HomePage"
            className="flex items-center gap-2 text-xl text-navbar-foreground font-semibold hover:opacity-50 transition-opacity no-underline px-2"
          >
            <img
              src={logo}
              width="30"
              height="30"
              alt="Logo"
            />
            QuizApp
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <Button
              variant="ghost"
              onClick={() => handleNavigate("/QuizList")}
              className="text-navbar-foreground hover:opacity-50 hover:bg-transparent px-2 mx-2 cursor-pointer"
            >
              Quizzes
            </Button>

            {user && (
              <>
                <Button
                  variant="ghost"
                  onClick={handleCreateClick}
                  className="text-navbar-foreground hover:opacity-50 bg-transparent hover:bg-transparent px-2 mx-2 cursor-pointer"
                >
                  Create quiz
                </Button>

                {isAdmin(user) && (
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/UserControl")}
                    className="text-navbar-foreground hover:opacity-50 bg-transparent hover:bg-transparent px-2 mx-2 cursor-pointer"
                  >
                    User Control
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex ml-auto justify-items-center">

            <ThemeToggle />

            {user ? (
              <DropdownMenu onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-navbar-foreground flex items-center gap-1 bg-transparent hover:bg-transparent hover:opacity-50 px-2 mx-2 cursor-pointer">
                    {user.unique_name}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleNavigate("/MyScores")} className="cursor-pointer">
                    My scores
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigate("/MyQuizzes")} className="cursor-pointer">
                    My Quizzes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigate("/UserProfile")} className="cursor-pointer">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      handleNavigate("/", { 
                        replace: true,
                        state: { message: "You have been logged out of the website." } 
                      });
                      setTimeout(() => logout(), 50); {/*  settimeout necessary for succesfull navigation from protectedRoute */}
                    }}
                    className="cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate("/CreateUser")}
                  className="text-navbar-foreground hover:opacity-50 hover:bg-transparent cursor-pointer"
                >
                  Create account
                </Button>
                <Button
                  variant="default"
                  onClick={() =>
                    handleNavigate("/LoginPage", {
                      state: { from: "/NavBar", message: "" },
                    })
                  }
                  className="bg-navbar-button-background text-navbar-button-foreground hover:text-navbar-foreground rounded-full cursor-pointer"
                >
                  Login
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden ml-auto">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button aria-label="menu" variant="ghost" size="icon" className="text-navbar-foreground hover:bg-navbar-hover cursor-pointer">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="navbar-vertical w-[300px] text-navbar-foreground flex flex-col [&>button]:cursor-pointer">
                <SheetHeader className="pb-1">
                  <SheetTitle className="text-foreground">
                    <a
                      href="/HomePage"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-2 text-xl text-navbar-foreground font-semibold hover:opacity-50 transition-opacity no-underline"
                      style={{ textDecoration: 'none' }}
                    >
                      <img
                        src={logo}
                        width="35"
                        height="35"
                        alt="Logo"
                      />
                      QuizApp
                    </a>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-2 flex-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/QuizList")}
                    className="justify-center hover:opacity-50 bg-transparent cursor-pointer"
                  >
                    Quizzes
                  </Button>

                  {user && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={handleCreateClick}
                        className="justify-center hover:opacity-50 bg-transparent cursor-pointer"
                      >
                        Create quiz
                      </Button>

                      {isAdmin(user) && (
                        <Button
                          variant="ghost"
                          onClick={() => handleNavigate("/UserControl")}
                          className="justify-center hover:opacity-50 bg-transparent cursor-pointer"
                        >
                          User Control
                        </Button>
                      )}

                      <DropdownMenu onOpenChange={setIsMobileDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="bg-transparent border-0 hover:opacity-50 hover:text-navbar-foreground cursor-pointer px-8 py-2 flex items-center gap-2">
                            {user.unique_name}
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${isMobileDropdownOpen ? 'rotate-180' : ''}`}
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-full">
                          <DropdownMenuItem onClick={() => handleNavigate("/MyScores")} className="cursor-pointer">
                            My scores
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleNavigate("/MyQuizzes")} className="cursor-pointer">
                            My Quizzes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleNavigate("/UserProfile")} className="cursor-pointer">
                            Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              handleNavigate("/", { 
                                replace: true,
                                state: { message: "You have been logged out of the website." } 
                              });
                              setTimeout(() => logout(), 50); {/* settimeout necessary for succesfull navigation from protectedRoute */}
                            }}
                            className="cursor-pointer"
                          >
                            Logout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}

                  {!user && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigate("/CreateUser")}
                        className="justify-center hover:opacity-50 bg-transparent cursor-pointer"
                      >
                        Create account
                      </Button>
                      <div className="flex justify-center my-2">
                        <Button
                          variant="default"
                          onClick={() =>
                            handleNavigate("/LoginPage", {
                              state: { from: "/NavBar", message: "" },
                            })
                          }
                          className="bg-navbar-button-background text-navbar-button-foreground cursor-pointer hover:text-navbar-foreground rounded-full px-8 py-2"
                        >
                          Login
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-center mb-4">
                  <ThemeToggle />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav >
  );
};

export default NavBar;