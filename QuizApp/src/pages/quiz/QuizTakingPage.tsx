import React, { useState, useEffect } from "react";
import type { IQuiz, IQuestion, QuizTakerProps } from '../../types/quiz';
import { getQuizById} from './QuizData';
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
/**
 * QuizTaker-komponenten viser spørsmålene for en valgt quiz og håndterer spilllogikken.
 */
const QuizTaker: React.FC<QuizTakerProps> = () => {
   const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const [currentQuiz, setCurrentQuiz] = useState<IQuiz | undefined>(undefined);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({}); // {questionId: selectedOptionId}
    const [showResults, setShowResults] = useState(false);

    // Laster quiz-data ved oppstart basert på URL-parameter
    useEffect(() => {
        if (quizId) {
            const id = parseInt(quizId, 10);
            const quizData = getQuizById(id);
            setCurrentQuiz(quizData);
        }
    }, [quizId]);

    // Håndterer feil hvis quiz ikke finnes
    if (!currentQuiz) {
        return (
            <Alert variant="danger" className="mt-5 text-center">
                <Alert.Heading>Oops! Quiz ikke funnet.</Alert.Heading>
                <p>Kunne ikke laste quiz med ID: {quizId}.</p>
                <Button variant="danger" onClick={() => navigate('/QuizList')}>Tilbake til listen</Button>
            </Alert>
        );
    }

    const totalQuestions = currentQuiz.questions.length;
    const currentQuestion: IQuestion = currentQuiz.questions[currentQuestionIndex];


    const handleAnswerSelect = (optionId: number) => {
        setUserAnswers({
            ...userAnswers,
            [currentQuestion.id]: optionId,
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setShowResults(true);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const calculateScore = () => {
        let score = 0;
        currentQuiz.questions.forEach(question => {
            if (userAnswers[question.id] === question.correctOptionId) {
                score += question.points;
            }
        });
        return score;
    };

    const calculateTotalPoints = () => {
        return currentQuiz.questions.reduce((sum, q) => sum + q.points, 0);
    };

    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const renderQuestion = () => (
        <>
            <ProgressBar 
                now={progress} 
                label={`${currentQuestionIndex + 1} av ${totalQuestions}`} 
                className="mb-4"
                variant="info"
            />
            <Card.Title className="h5 mb-4">{currentQuestion.questionText}</Card.Title>
            
            <div className="d-grid gap-3">
                {currentQuestion.answerOptions.map(option => (
                    <Button
                        key={option.id}
                        variant={userAnswers[currentQuestion.id] === option.id ? 'primary' : 'outline-primary'}
                        size="lg"
                        onClick={() => handleAnswerSelect(option.id)}
                        className="text-start"
                    >
                        {option.text}
                    </Button>
                ))}
            </div>

            <div className="d-flex justify-content-between mt-4">
                <Button 
                    variant="secondary" 
                    onClick={handlePrevious} 
                    disabled={currentQuestionIndex === 0}
                >
                    <i className="bi bi-arrow-left me-2"></i> Forrige
                </Button>
                <Button 
                    variant="success" 
                    onClick={handleNext}
                    disabled={userAnswers[currentQuestion.id] === undefined} // Krever svar før neste
                >
                    {currentQuestionIndex === totalQuestions - 1 ? 'Fullfør Quiz' : 'Neste Spørsmål'}
                    <i className="bi bi-arrow-right ms-2"></i>
                </Button>
            </div>
        </>
    );

    const renderResults = () => {
        const finalScore = calculateScore();
        const totalPoints = calculateTotalPoints();
        const scorePercentage = (finalScore / totalPoints) * 100;

        return (
            <div className="text-center p-4">
                <h2 className="display-4 text-success mb-4">Quiz Fullført!</h2>
                <Alert variant={scorePercentage >= 50 ? 'success' : 'warning'}>
                    <p className="lead mb-1">Din score:</p>
                    <h3 className="fw-bold">{finalScore} av {totalPoints} poeng</h3>
                    <p className="h5">({scorePercentage.toFixed(1)}%)</p>
                </Alert>
                <Button 
                    variant="primary" 
                    className="mt-3 me-2"
                    onClick={() => {
                        setCurrentQuestionIndex(0);
                        setUserAnswers({});
                        setShowResults(false);
                    }}
                >
                    Ta Quizen Igjen
                </Button>
                <Button 
                    variant="secondary" 
                    className="mt-3"
                    onClick={() => navigate('/QuizList')} // Går tilbake til listen
                >
                    <i className="bi bi-list-task me-2"></i> Tilbake til Quiz-listen
                </Button>
            </div>
        );
    };

    return (
        <div className="py-5">
            <Card className="shadow-lg mx-auto" style={{ maxWidth: '700px' }}>
                <Card.Header className="bg-primary text-white text-center">
                    <h2 className="mb-0">{currentQuiz.title}</h2>
                </Card.Header>
                <Card.Body>
                    {showResults ? renderResults() : renderQuestion()}
                </Card.Body>
            </Card>
        </div>
    );
};

export default QuizTaker;
