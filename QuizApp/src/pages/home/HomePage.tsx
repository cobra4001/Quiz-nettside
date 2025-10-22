import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { useAuth } from "../../auth/AuthContext";
import { useLocation } from "react-router-dom";

const HomePage: React.FC = () => {

    const { user } = useAuth();
    const location = useLocation();
    const [alertMessage, setAlertMessage] = React.useState<string | null>(null);
    const [showToast, setShowToast] = React.useState(false);

    React.useEffect(() => {
        const state = location.state as { message?: string; from?: string };
        if (state?.message) {
            setAlertMessage(state.message);
            setShowToast(true);

            // Clear the message from navigation state to avoid repeat display
            window.history.replaceState({}, document.title);

            // Auto-hide after 3 seconds
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    return (
    <>
      <ToastContainer
        position="top-center"
        className="p-3"
        style={{ zIndex: 9999,
            marginTop: '70px'
         }}
      >
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          bg="info"
          className="text-white text-center shadow-lg"
        >
          <Toast.Body>{alertMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div
          className="card shadow border-0 rounded-4 p-5 w-100"
          style={{ maxWidth: "480px" }}
        >
          <div className="card-body text-center">
            <h1 className="card-title fw-bold fs-1 text-dark mb-3">
              {!user ? "Quiz Hub" : `Welcome back ${user.sub}`} {/* must be sub here, or change the JWT token parsing of username*/}
            </h1>
            <p className="card-text lead text-muted mb-5">
              Create custom quizzes, and challenge your friends!
            </p>

            <div className="d-grid gap-3">
              {!user ? (
                <a href="/LoginPage" className="btn btn-success btn-lg">
                  Login to Create a Quiz
                </a>
              ) : (
                <a href="/quizcreate" className="btn btn-success btn-lg">
                  Create a Quiz
                </a>
              )}
              <a href="/QuizList" className="btn btn-secondary btn-lg">
                Take a Quiz
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
