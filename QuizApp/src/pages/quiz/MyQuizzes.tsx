import React, { useEffect, useState } from 'react';
import type { QuizListProps } from '../../types/quiz';
import { useNavigate } from 'react-router-dom';
import { fetchMyQuizzes, deleteQuiz } from './QuizService';

// Page showing the user's quizzes
const MyQuizzes: React.FC<QuizListProps> = () => {
  const navigate = useNavigate();
  // Local state
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Get user's quizzes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchMyQuizzes();
        if (!mounted) return;
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message || 'Failed to load your quizzes');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Go to quiz taking page
  const navigateOnclick = async (quizId: number) => {
    navigate(`/QuizTakingPage/${quizId}`);
  };

  // Delete quiz and show success message
  const handleQuizDeleted = async (quizId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quiz? This action cannot be undone!"
    );
    if (!confirmDelete) return;

    try {
      await deleteQuiz(quizId);
      setQuizzes(prev => prev.filter(q => q.id !== quizId));

      setSuccessMsg("Quiz deleted successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error: any) {
      console.error("Could not delete quiz:", error);
      alert(error?.message || "Could not delete quiz.");
    }
  };

  return (
    <div className="d-flex justify-content-center min-vh-100 p-3">
      <div className="container py-5" style={{ maxWidth: "800px" }}>
        <h1 className="text-center fw-bold text-success mb-5 display-4">
          My Quizzes
        </h1>
        {/* Status and alerts */}
        {loading && (
          <div className="alert alert-secondary text-center" role="status">
            Loading your quizzes...
          </div>
        )}
        {error && (
          <div className="alert alert-danger text-center" role="alert">{error}</div>
        )}
        {successMsg && (
          <div className="alert alert-success text-center">{successMsg}</div>
        )}
        {!loading && !error && quizzes.length === 0 && (
          <div className="alert alert-info text-center" role="alert">
            You haven't created any quizzes yet. <a href="/quizcreate" className="alert-link">Create your first quiz!</a>
          </div>
        )}

        {/* Quiz list */}
        {!loading && !error && quizzes.length > 0 && (
          <div className="row row-cols-1 g-4">
            {quizzes.map((quiz: any) => (
              <div className="col" key={quiz.id}>
                <div className="card shadow-sm h-100 border-0 p-3 p-md-4 bg-primary-subtle hover-zoom">

                  <div className="d-flex align-items-start position-relative">
                    <div className="text-center mx-auto">
                      <h2 className="card-title fw-bolder fs-4 text-dark mb-2">{quiz.title}</h2>
                      <p className="card-text mb-3">{quiz.description}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateOnclick(quiz.id); }}
                      className="btn btn-success fw-bold rounded-pill px-4 me-2 my-1"
                    >
                      Start Quiz
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/QuizUpdate/${quiz.id}`); }}
                      className="btn btn-primary fw-bold rounded-pill px-4 me-2 my-2"
                    >
                      Update Quiz
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuizDeleted(quiz.id); }}
                      className="btn btn-danger fw-bold rounded-pill px-4"
                    >
                      Delete Quiz
                    </button>
                  </div>
                  <div className="position-absolute bottom-0 end-0">
                      <span
                        className="badge text-dark px-3"
                        title="Number of questions"
                      >
                        {quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}
                      </span>
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

export default MyQuizzes;