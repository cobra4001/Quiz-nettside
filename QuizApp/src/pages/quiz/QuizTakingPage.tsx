import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface IAnswerOption {
    id: number;
    text: string;
    isCorrect: boolean;
}

interface IQuestion {
    id: number;
    questionText: string;
    points: number;
    answerOptions: IAnswerOption[];
}

const QuizTakingPage: React.FC = () => {
    const questions: IQuestion[] = [
        {
            id: 1,
            questionText: "What is the capital of France?",
            points: 10,
            answerOptions: [
                { id: 1, text: "Berlin", isCorrect: false },
                { id: 2, text: "Madrid", isCorrect: false },
                { id: 3, text: "Paris", isCorrect: true },
                { id: 4, text: "Rome", isCorrect: false },
            ],
        },
        {
            id: 2,
            questionText: "Which planet is known as the Red Planet?",
            points: 15,
            answerOptions: [
                { id: 1, text: "Earth", isCorrect: false },
                { id: 2, text: "Mars", isCorrect: true },
                { id: 3, text: "Jupiter", isCorrect: false },
                { id: 4, text: "Saturn", isCorrect: false },
            ],
        },
    ];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);

    const handleAnswerOptionClick = (optionId: number) => {
        setSelectedAnswerId(optionId);
    };

    const handleSubmit = () => {
        if (selectedAnswerId === null) {
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        const correctAnswer = currentQuestion.answerOptions.find((o) => o.isCorrect);

        if (correctAnswer && selectedAnswerId === correctAnswer.id) {
            setScore(score + currentQuestion.points);
        }

        const nextQuestion = currentQuestionIndex + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestionIndex(nextQuestion);
            setSelectedAnswerId(null);
        } else {
            setShowResult(true);
        }
    };

    const handleRestartQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswerId(null);
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ maxWidth: "700px", width: "100%" }}>
                <h1 className="text-center fw-bold mb-4"> Quiz Taker</h1> {/* This should get the Title of the quiz */}

                {!showResult ? (
                    <>
                        {/* Progress */}
                        <div className="progress mb-4" style={{ height: "10px" }}>
                            <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{
                                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                                }}
                            ></div>
                        </div>

                        <div className="d-flex justify-content-between text-muted small mb-3">
                            <span>
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                            <span>Points: {questions[currentQuestionIndex].points}</span>
                        </div>

                        <h4 className="fw-semibold mb-4">
                            {questions[currentQuestionIndex].questionText}
                        </h4>

                        <div className="row g-3">
                            {questions[currentQuestionIndex].answerOptions.map((option) => (
                                <div className="col-12 col-sm-6" key={option.id}>
                                    <button
                                        onClick={() => handleAnswerOptionClick(option.id)}
                                        className={`btn w-100 py-3 shadow-sm ${
                                            selectedAnswerId === option.id
                                                ? "btn-primary"
                                                : "btn-outline-secondary"
                                        }`}
                                    >
                                        {option.text}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={selectedAnswerId === null}
                                className={`btn btn-lg px-5 ${
                                    selectedAnswerId === null
                                        ? "btn-secondary disabled"
                                        : "btn-success"
                                }`}
                            >
                                Submit Answer
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <h2 className="fw-bold mb-3"> Quiz Complete!</h2>
                        <p className="fs-5 text-muted mb-4">
                            You scored{" "}
                            <span className="fw-bold text-success">{score}</span> out of{" "}
                            {questions.reduce((t, q) => t + q.points, 0)} points.
                        </p>
                        <button
                            onClick={handleRestartQuiz}
                            className="btn btn-primary btn-lg px-5"
                        >
                            Restart Quiz
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizTakingPage;
 