import React from "react";
// Don't forget to include the Bootstrap CSS link in your index.html file:
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" xintegrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

// Use React.FC to type the functional component.
// It explicitly types the component and its props (even if empty).
const HomePage: React.FC = () => {
    return (
        // Main container with a centered, full-screen layout using flexbox
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            {/* Main content card with Bootstrap's card component */}
            <div className="card shadow border-0 rounded-4 p-5 w-100" style={{ maxWidth: '480px' }}>
                <div className="card-body text-center">
                    <h1 className="card-title fw-bold fs-1 text-dark mb-3">
                        Quiz Hub
                    </h1>
                    <p className="card-text lead text-muted mb-5">
                        Create, share, and challenge your friends with custom quizzes!
                    </p>

                    {/* Container for the action buttons */}
                    <div className="d-grid gap-3">
                        {/* Button for creating a quiz */}
                        <a href="/create-quiz" className="btn btn-primary btn-lg">
                            Create a Quiz
                        </a>
                        {/* Button for taking a quiz */}
                        <a href="/take-quiz" className="btn btn-secondary btn-lg">
                            Take a Quiz
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
