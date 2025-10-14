import React from "react";
import { useAuth } from "../../auth/AuthContext";

const HomePage: React.FC = () => {

    const {user} = useAuth();
    console.log(user);
    return (
        // Main container with a centered, full-screen layout using flexbox
        <div className="d-flex align-items-center justify-content-center min-vh-100">
            {/* Main content card with Bootstrap's card component */}
            <div className="card shadow border-0 rounded-4 p-5 w-100" style={{ maxWidth: '480px' }}>
                <div className="card-body text-center">
                    <h1 className="card-title fw-bold fs-1 text-dark mb-3">
                        {!user ? 'Quiz Hub' : `Welcome back ${user.unique_name}`} {/*Denne viser username, hvis logget ind */}
                    </h1>
                    <p className="card-text lead text-muted mb-5">
                        Create custom quizzes, and challenge your friends!
                    </p>

                    {/* Container for the action buttons */}
                    <div className="d-grid gap-3">
                        {/* Button for creating a quiz */}
                        {(!user) ? <a href="/LoginPage" className="btn btn-primary btn-lg">
                            Login to Create a Quiz
                        </a> : <a href="/quizcreate" className="btn btn-primary btn-lg">
                            Create a Quiz
                        </a>
                        }
                        
                        {/* Button for taking a quiz */}
                        <a href="/QuizList" className="btn btn-secondary btn-lg">
                            Take a Quiz
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
