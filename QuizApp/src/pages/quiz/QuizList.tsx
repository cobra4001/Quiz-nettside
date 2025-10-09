import React, { useEffect, useState } from 'react';
import type { QuizListProps } from '../../types/quiz';
import { useNavigate } from 'react-router-dom';
import { fetchQuizzes, deleteQuiz } from './QuizService';


/**
 * QuizList-komponenten viser en dynamisk liste over alle tilgjengelige quizzer.
 * Den bruker Bootstrap 5 for et responsivt og tiltalende design.
 */
const QuizList: React.FC<QuizListProps> = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // Deletes a quiz both in the backend and locally
    const handleQuizDeleted = async (quizId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
        await deleteQuiz(quizId); // Call QuizService to delete
        // Remove quiz from local state
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
    } catch (error: any) {
        console.error("Could not delete quiz:", error);
        alert(error?.message || "Could not delete quiz.");
    }
};

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
        await fetch(`/QuizTakingPage/${quizId}`);
        
        navigate(`/QuizTakingPage/${quizId}`);
    };

    return (
        // Bootstrap: Sentrerer innholdet vertikalt og horisontalt
        <div className="d-flex justify-content-center min-vh-100 p-3">
            <div className="container py-5" style={{ maxWidth: "800px" }}>
                <h1 className="text-center fw-bold text-primary mb-5 display-4">
                    Available Quizzes
                </h1>

                {loading && (
                    <div className="alert alert-secondary text-center" role="status">Loading quizzes...</div>
                )}
                {error && (
                    <div className="alert alert-danger text-center" role="alert">{error}</div>
                )}
                {!loading && !error && quizzes.length === 0 && (
                    <div className="alert alert-info text-center" role="alert">No quizzes yet. Create one!</div>
                )}
                {!loading && !error && quizzes.length > 0 && (
                    // Viser quizer i et responsivt grid med rader
                    <div className="row row-cols-1 g-4">
                        {quizzes.map((quiz: any) => (
                            <div className="col" key={quiz.id}>
                                <div 
                                    className="card shadow-sm h-100 border-0 p-3 p-md-4 bg-primary-subtle hover-zoom" 
                                    onClick={() => {navigateOnclick(quiz.id); }}
                                    style={{ 
                                        cursor: 'pointer', 
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease', 
                                        borderRadius: '1rem' 
                                    }}
                                >
                                    <div className="d-flex align-items-start position-relative">
                                    {/* Centered title & description */}
                                    <div className="text-center mx-auto">
                                        <h2 className="card-title fw-bolder fs-4 text-dark mb-2">{quiz.title}</h2>
                                        <p className="card-text mb-3">{quiz.description || 'No description provided.'}</p>
                                    </div>

                                    {/* Number of questions in top-right corner */}
                                    <div className="position-absolute top-0 end-0">
                                        <span className="badge bg-info text-dark rounded-pill py-2 px-3 fw-bold" title="Number of questions">
                                        {quiz.questionCount ?? (quiz.questions ? quiz.questions.length : 0)} questions
                                        </span>
                                    </div>
                                    </div>

                                    
                                    {/* Action buttons */}
                                    <div className="mt-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigateOnclick(quiz.id); }}
                                            className="btn btn-success fw-bold rounded-pill px-4 me-2"
                                        >
                                            Start Quiz
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/QuizUpdate/${quiz.id}`); }}
                                            className="btn btn-primary fw-bold rounded-pill px-4 me-2"
                                        >
                                            Update Quiz
                                        </button>

                                       <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); // Prevent card click from navigating
                                            handleQuizDeleted(quiz.id); 
                                        }}
                                        className="btn btn-danger fw-bold rounded-pill px-4"
                                    >
                                        Delete Quiz
                                    </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Custom CSS for hover effect */}
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