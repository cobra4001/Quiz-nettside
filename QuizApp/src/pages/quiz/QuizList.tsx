// a reusable component to show a list of quizzes. with logic for Users and Admin

import React from "react";
import { useNavigate } from "react-router-dom";
import { deleteQuiz } from "./QuizService";
import type { QuizListProps } from "../../types/quiz";
import "./QuizList.css";

const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  loading,
  error,
  successMsg,
  onQuizDeleted,
  title,
  emptyMessage,
  showUpdateButton = false,
  showDeleteButton = false,
  showAdminDelete = false,
  currentUserName = "",
}) => {
  const navigate = useNavigate();

  const navigateOnclick = (quizId: number) => {
    navigate(`/QuizTakingPage/${quizId}`);
  };

  const handleQuizDeleted = async (quizId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quiz? This action cannot be undone!"
    );
    if (!confirmDelete) return;

    try {
      await deleteQuiz(quizId);
      onQuizDeleted(quizId);
    } catch (error: any) {
      console.error("Could not delete quiz:", error);
      alert(error?.message || "Could not delete quiz.");
    }
  };

  return (
    <div className="d-flex justify-content-center min-vh-100 p-3">
      <div className="container py-5" style={{ maxWidth: "800px" }}>
        <h1 className="text-center fw-bold quiz-title mb-5 display-4">
          {title}
        </h1>

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success text-center">{successMsg}</div>
        )}
        {!loading && !error && quizzes.length === 0 && (
          <div className="alert alert-info text-center" role="alert">
            {emptyMessage}
          </div>
        )}

        {!loading && !error && quizzes.length > 0 && (
          <div className="row row-cols-1 g-4">
            {quizzes.map((quiz: any) => (
              <div className="col" key={quiz.id}>
                <div
                  className={`card shadow-sm h-100 border-0 p-3 p-md-4 quiz-card ${
                    !showUpdateButton && !showDeleteButton ? "hover-zoom" : ""
                  }`}
                  onClick={
                    !showUpdateButton && !showDeleteButton
                      ? () => navigateOnclick(quiz.id)
                      : undefined
                  }
                  style={{
                    cursor:
                      !showUpdateButton && !showDeleteButton
                        ? "pointer"
                        : "default",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    borderRadius: "1rem",
                  }}
                >
                  <div className="position-absolute bottom-0 end-0">
                    <span
                      className="badge quiz-badge px-3"
                      title="Number of questions"
                    >
                      {quiz.questionCount}{" "}
                      {quiz.questionCount === 1 ? "question" : "questions"}
                    </span>
                  </div>

                  <div className="d-flex align-items-start position-relative">
                    <div className="text-center mx-auto">
                      <h2 className="card-title fw-bolder fs-4 quiz-card-title mb-2">
                        {quiz.title}
                      </h2>
                      <p className="card-text quiz-card-text mb-3">{quiz.description}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateOnclick(quiz.id);
                      }}
                      className="btn btn-success fw-bold rounded-pill px-4 me-2 my-1"
                    >
                      Start Quiz
                    </button>

                    {showUpdateButton && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/QuizUpdate/${quiz.id}`);
                        }}
                        className="btn btn-primary fw-bold rounded-pill px-4 me-2 my-1"
                      >
                        Update Quiz
                      </button>
                    )}

                    {showDeleteButton && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuizDeleted(quiz.id);
                        }}
                        className="btn btn-danger fw-bold rounded-pill px-4 my-1"
                      >
                        Delete Quiz
                      </button>
                    )}

                    {/*If the user is Admin, show a delete button */}
                    {/*Username = Admin password = Admin1234 */}
                    {showAdminDelete && currentUserName === "Admin" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuizDeleted(quiz.id);
                        }}
                        className="btn btn-danger fw-bold rounded-pill px-4 me-2 my-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;