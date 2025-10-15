import React, { useEffect, useState } from 'react';
import type { QuizListProps } from '../../types/quiz';
import { useNavigate } from 'react-router-dom';
import { fetchQuizzes } from './QuizService';

const QuizList: React.FC<QuizListProps> = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Get all quizzes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchQuizzes();
        if (!mounted) return;
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message || 'Failed to load quizzes');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const navigateOnclick = async (quizId: number) => {
    navigate(`/QuizTakingPage/${quizId}`);
  };

 
  return (
    <div className="d-flex justify-content-center min-vh-100 p-3">
      <div className="container py-5" style={{ maxWidth: "800px" }}>
        <h1 className="text-center fw-bold text-success mb-5 display-4">
          Available Quizzes
        </h1>

        {loading && (
          <div className="alert alert-secondary text-center" role="status">
            Loading quizzes...
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
            No quizzes yet. Create one!
          </div>
        )}

        {!loading && !error && quizzes.length > 0 && (
          <div className="row row-cols-1 g-4">
            {quizzes.map((quiz: any) => (
              <div className="col" key={quiz.id}>
                <div
                  className="card shadow-sm h-100 border-0 p-3 p-md-4 bg-primary-subtle hover-zoom"
                  onClick={() => navigateOnclick(quiz.id)}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    borderRadius: '1rem'
                  }}
                >
                  <div className="d-flex align-items-start position-relative">
                    <div className="text-center mx-auto">
                      <h2 className="card-title fw-bolder fs-4 text-dark mb-2">{quiz.title}</h2>
                      <p className="card-text mb-3">{quiz.description}</p>
                    </div>

                    <div className="position-absolute top-0 end-0">
                      <span
                        className="badge bg-info text-dark rounded-pill py-2 px-3 fw-bold"
                        title="Number of questions"
                      >
                        {quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateOnclick(quiz.id); }}
                      className="btn btn-success fw-bold rounded-pill px-4 me-2"
                    >
                      Start Quiz
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`
          .hover-zoom:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15)!important; 
          }
          .hover-zoom {
            transform: translateY(0);
          }
        `}</style>
      </div>
    </div>
  );
};

export default QuizList;
