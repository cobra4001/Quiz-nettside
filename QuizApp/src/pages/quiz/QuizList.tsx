import React from 'react';
import type { IQuiz } from '../../types/quiz';
import { AllQuizzes } from './QuizData'; 

/**
 * QuizList-komponenten viser en dynamisk liste over alle tilgjengelige quizzer.
 * Den bruker Bootstrap 5 for et responsivt og tiltalende design.
 */
const QuizList: React.FC = () => {
    // Bruker mock-data fra AllQuizzes
    const quizzes: IQuiz[] = AllQuizzes;

    return (
        // Bootstrap: Sentrerer innholdet vertikalt og horisontalt
        <div className="d-flex justify-content-center min-vh-100 bg-light p-3">
            <div className="container py-5" style={{ maxWidth: "800px" }}>
                <h1 className="text-center fw-bold text-primary mb-5 display-4">
                    Tilgjengelige Quizzer
                </h1>

                {quizzes.length === 0 ? (
                    <div className="alert alert-info text-center" role="alert">
                        Ingen quizzer funnet. Legg til nye quizzer for å starte!
                    </div>
                ) : (
                    // Viser quizer i et responsivt grid med rader
                    <div className="row row-cols-1 g-4">
                        {quizzes.map((quiz) => (
                            <div className="col" key={quiz.id}>
                                <div 
                                    className="card shadow-sm h-100 border-0 p-3 p-md-4 bg-white hover-zoom" 
                                    // Simulerer klikkbarhet (i en ekte app ville dette vært en lenke)
                                    onClick={() => console.log(`Starter Quiz ID: ${quiz.id}`)}
                                    style={{ 
                                        cursor: 'pointer', 
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease', 
                                        borderRadius: '1rem' 
                                    }}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            {/* Quiz Tittel */}
                                            <h2 className="card-title fw-bolder fs-4 text-dark mb-2">{quiz.title}</h2>
                                            {/* Beskrivelse */}
                                            <p className="card-text text-muted mb-3">{quiz.description}</p>
                                        </div>
                                        {/* Ikon/Antall spørsmål */}
                                        <div className="text-end ms-3">
                                            <span className="badge bg-info text-dark rounded-pill py-2 px-3 fw-bold">
                                                {quiz.questions.length} spørsmål
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3">
                                        <button className="btn btn-sm btn-primary fw-bold rounded-pill px-4">
                                            Start Quiz
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Custom CSS for hover-effekt, da Bootstrap ikke har en standard klasse for dette */}
                <style>{`
                    .hover-zoom:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15)!important; /* Mindre skygge */
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
