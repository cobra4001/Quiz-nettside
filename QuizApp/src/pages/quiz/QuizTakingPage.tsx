import React, { useState, useEffect } from "react";
import type { IQuiz, IQuestion, QuizTakerProps } from '../../types/quiz';
import { fetchQuizById, submitQuiz } from './QuizService';
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import '../../App.css';
/**
 * The QuizTaker component displays the questions for a selected quiz and handles the game logic.
 */
const QuizTaker: React.FC<QuizTakerProps> = () => {
   const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const [currentQuiz, setCurrentQuiz] = useState<IQuiz | undefined>(undefined);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({}); // {questionId: selectedOptionId}
    const [showResults, setShowResults] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [result, setResult] = useState<{ score: number; correctAnswers: number; totalQuestions: number } | null>(null);

    // Loads quiz data on startup based on URL parameter
    useEffect(() => {
        const load = async () => {
            if (!quizId) return;
            const id = parseInt(quizId, 10);
            if (Number.isNaN(id)) return;
            try {
                const data = await fetchQuizById(id);
                if (!data) return;
                // Backend returns
        
                const mapped: IQuiz = {
                    id: data.id,
                    title: data.title,
                    description: data.description || 'No description provided.',
                    questions: (data.questions || []).map((q: any) => ({
                        id: q.id,
                        questionText: q.questionText,
                        points: q.points,
                        // Hide the answer initially
                        correctOptionId: -1,
                        answerOptions: (q.answers || []).map((a: any) => ({ id: a.id, text: a.answerText }))
                    }))
                };
                setCurrentQuiz(mapped);
            } catch (err) {
                console.error('Failed to load quiz', err);
            }
        };
        load();
    }, [quizId]);

    // Handles error if quiz not found
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

    const handleNext = async () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Last question answered, send to backend for score
            if (!currentQuiz) return;
            if (isSubmitting) return;
            setIsSubmitting(true);
            setSubmitError(null);
            try {
                const payload = { quizId: currentQuiz.id, selectedAnswers: userAnswers };
                console.debug('Submitting quiz payload', payload);
                // Validate user answers against quiz structure
                const invalidMappings: Array<{ questionId: number; answerId: number }> = [];
                currentQuiz.questions.forEach(q => {
                    const chosen = userAnswers[q.id];
                    if (chosen && !q.answerOptions.some(a => a.id === chosen)) {
                        invalidMappings.push({ questionId: q.id, answerId: chosen });
                    }
                });
                if (invalidMappings.length) {
                    console.warn('Invalid question->answer mappings detected', invalidMappings);
                }
                const serverResult = await submitQuiz(payload);
                console.debug('Server submit result', serverResult);
                if (serverResult) {
                    const scoreFromServer = serverResult.Score ?? serverResult.score ?? 0;
                    const correctFromServer = serverResult.CorrectAnswers ?? serverResult.correctAnswers ?? 0;
                    const totalFromServer = serverResult.TotalQuestions ?? serverResult.totalQuestions ?? currentQuiz.questions.length;
                    setResult({
                        score: scoreFromServer,
                        correctAnswers: correctFromServer,
                        totalQuestions: totalFromServer
                    });
                    // Log details if server returns error
                    if (scoreFromServer === 0 && Object.keys(userAnswers).length > 0) {
                        console.warn('Server returned score=0; debugging details', {
                            answered: userAnswers,
                            questions: currentQuiz.questions.map(q => ({ qid: q.id, answers: q.answerOptions.map(a => a.id) }))
                        });
                    }
                } else {
                    console.warn('ServerResult was null/empty; falling back to local placeholder.');
                    setResult({
                        score: 0,
                        correctAnswers: 0,
                        totalQuestions: currentQuiz.questions.length
                    });
                }
                setShowResults(true);
            } catch (err: any) {
                console.error('Submit failed', err);
                setSubmitError(err.message || 'Kunne ikke sende inn quiz.');
                setShowResults(true); 
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Server determines what is the correct answer
    const calculateScore = () => 0;

    const calculateTotalPoints = () => {
        return currentQuiz.questions.reduce((sum, q) => sum + q.points, 0);
    };

    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const renderQuestion = () => (
        <>
            <ProgressBar 
                now={progress} 
  //              label={`${currentQuestionIndex + 1} av ${totalQuestions}`} 
                className="mb-4"
                variant="info"
            />
            <Card.Title className="h5 mb-4">{currentQuestion.questionText}</Card.Title>
            
            <div className="d-grid gap-3">
                {currentQuestion.answerOptions.map(option => (
                    <Button
                        key={option.id}
                        variant={userAnswers[currentQuestion.id] === option.id ? 'info' : 'outline-dark'}
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
                    Previous
                </Button>
                <p>Question <br></br>{currentQuestionIndex + 1} of {totalQuestions}</p>
                <Button 
                    variant="success" 
                    onClick={handleNext}
                    disabled={userAnswers[currentQuestion.id] === undefined || isSubmitting}
                >
                    {currentQuestionIndex === totalQuestions - 1 ? (isSubmitting ? 'Sender...' : 'Submit Quiz') : 'Next question'}
                </Button>
            </div>
        </>
    );

    const renderResults = () => {
        if (isSubmitting) {
            return <div className="text-center p-4"><h4>Sending in results</h4></div>;
        }
        if (submitError) {
            return (
                <Alert variant="danger" className="text-center">
                    <p>{submitError}</p>
                    <Button variant="secondary" onClick={() => navigate('/QuizList')}>Back</Button>
                </Alert>
            );
        }
        if (!result) {
            return <div className="text-center p-4"><h4>Receiving results...</h4></div>;
        }
        const totalPoints = calculateTotalPoints();
        const finalScore = result.score;
        const scorePercentage = totalPoints > 0 ? (finalScore / totalPoints) * 100 : 0;

        return (
            <div className="text-center p-4">
                <h2 className="display-4 text-success mb-4">Quiz Completed!</h2>
                <Alert variant={scorePercentage >= 50 ? 'success' : 'warning'}>
                    <p className="lead mb-1">your score:</p>
                    <h3 className="fw-bold">{finalScore} of {totalPoints} points</h3>
                    <p className="h5">({scorePercentage.toFixed(1)}%)</p>
                </Alert>
                <Button 
                    variant="success" 
                    className="mt-3 me-2"
                    onClick={() => {
                        setCurrentQuestionIndex(0);
                        setUserAnswers({});
                        setShowResults(false);
                        setResult(null);
                        setSubmitError(null);
                    }}
                >
                    Take the Quiz again
                </Button>
                <Button 
                    variant="secondary" 
                    className="mt-3"
                    onClick={() => navigate('/QuizList')} // Goes back to the list
                >
                     Back to Quiz-list
                </Button>
            </div>
        );
    };

    return (
        <div className="py-5">
            <Card className="shadow-lg mx-auto TakeQuiz">
                <Card.Header className="bg-success text-white text-center">
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
