import React, { useState } from "react";
import type { IQuiz, IQuestion } from '../../types/quiz';
import { QuizTestData } from "./QuizData";
import "bootstrap/dist/css/bootstrap.min.css";


const QuizTaker: React.FC = () => {
    // Bruker InitialQuizData til å sette opp quiz-tilstanden
    const [quizData] = useState<IQuiz>(QuizTestData);
    const questions: IQuestion[] = quizData.questions;

    // Tilstand for quiz-progresjon
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [showResult, setShowResult] = useState<boolean>(false);

    // Tilstand for det valgte svaret på gjeldende spørsmål
    const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);

    /**
     * Setter det valgte svaret når brukeren klikker på et alternativ.
     * @param optionId ID-en til det valgte svaralternativet.
     */
    const handleAnswerOptionClick = (optionId: number) => {
        setSelectedAnswerId(optionId);
    };

    /**
     * Behandler innsending av svar: sjekker korrekthet, oppdaterer poengsum
     * og navigerer til neste spørsmål eller resultatskjermen.
     */
    const handleSubmit = () => {
        if (selectedAnswerId === null) return;

        const currentQuestion = questions[currentQuestionIndex];
        const selectedOption = currentQuestion.answerOptions.find(opt => opt.id === selectedAnswerId);

        // Sjekker om svaret er korrekt og legger til poeng
        if (selectedOption && selectedOption.isCorrect) {
            setScore(prevScore => prevScore + currentQuestion.points);
        }

        const nextQuestionIndex = currentQuestionIndex + 1;

        if (nextQuestionIndex < questions.length) {
            // Gå til neste spørsmål
            setCurrentQuestionIndex(nextQuestionIndex);
            setSelectedAnswerId(null); // Tilbakestill valgt svar
        } else {
            // Quizen er fullført
            setShowResult(true);
        }
    };

    /**
     * Tilbakestiller alle tilstander for å starte quizen på nytt.
     */
    const handleRestartQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswerId(null);
    };

    // Beregner totalt antall poeng
    const totalPoints = questions.reduce((total, q) => total + q.points, 0);
    // Beregner fremdriftslinjens bredde
    const progressWidth = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    // Sikrer at vi ikke prøver å aksessére et spørsmål som ikke eksisterer (kun relevant ved initialisering)
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
         <div className="d-flex justify-content-center align-items-center min-vh-100 p-3">
            {/* Bootstrap: card for innholdsboksen, shadow-lg for skygge, p-5 for polstring, max-width for responsiv begrensning */}
            <div className="card shadow-lg p-4 p-md-5 w-100" style={{ maxWidth: "550px", borderRadius: "1rem" }}>
                <h1 className="text-center fw-bold fs-3 text-dark mb-5">
                    {quizData.title}
                </h1>

                {!showResult && currentQuestion ? (
                    <>
                        {/* Fremdriftslinje (Progress Bar) */}
                        <div className="progress mb-4" style={{ height: "10px" }}>
                            <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${progressWidth}%` }}
                                aria-valuenow={progressWidth}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            ></div>
                        </div>

                        {/* Spørsmålsnummer og Poeng */}
                        <div className="d-flex justify-content-between text-muted small mb-4">
                            <span>
                                Spørsmål {currentQuestionIndex + 1} av {questions.length}
                            </span>
                            <span className="fw-semibold text-dark">Poeng: {currentQuestion.points}</span>
                        </div>

                        {/* Spørsmålstekst */}
                        <h4 className="fs-5 fw-semibold mb-4 text-dark">
                            {currentQuestion.questionText}
                        </h4>

                        {/* Svaralternativer (Row for grid) */}
                        <div className="row g-3">
                            {currentQuestion.answerOptions.map((option) => (
                                // Bruker col-12 for full bredde på mobil, og col-md-6 på større skjermer
                                <div className="col-12 col-md-6" key={option.id}>
                                    <button
                                        onClick={() => handleAnswerOptionClick(option.id)}
                                        className={`btn w-100 py-3 shadow-sm rounded-3 fw-medium transition ${
                                            selectedAnswerId === option.id
                                                ? "btn-primary active"
                                                : "btn-outline-secondary"
                                            }`}
                                        style={{ transition: "all 0.2s" }}
                                    >
                                        {option.text}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Innsendingsknapp */}
                        <div className="text-center mt-5">
                            <button
                                onClick={handleSubmit}
                                disabled={selectedAnswerId === null}
                                className={`btn btn-lg px-5 fw-bold rounded-pill transition ${
                                    selectedAnswerId === null
                                        ? "btn-secondary disabled"
                                        : "btn-success shadow-success"
                                }`}
                            >
                                Send svar
                            </button>
                        </div>
                    </>
                ) : (
                    /* Resultatvisning */
                    <div className="text-center p-4">
                        <h2 className="fw-bold text-success display-5 mb-3">Quiz Fullført!</h2>
                        <p className="fs-5 text-secondary mb-4">
                            Du fikk <span className="fw-bolder text-success">{score}</span> ut av totalt <span className="fw-bolder">{totalPoints}</span> poeng.
                        </p>
                        <button
                            onClick={handleRestartQuiz}
                            className="btn btn-primary btn-lg px-5 fw-bold rounded-pill shadow-primary"
                        >
                            Take the quiz again
                        </button>
                        <button 
                            className="btn btn-secondary btn-lg px-5 fw-bold rounded-pill shadow-secondary mt-3"
                            onClick={() => window.location.href = '/homepage'} // Ændre til QUIZ LIST PAGE NÅR DEN ER KLAR
                            >
                            go to Quiz List
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizTaker;
