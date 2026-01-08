import React, { useState, useEffect } from "react";
import type { IQuiz, IQuestion, QuizTakerProps } from '../../types/quiz';
import { fetchQuizById, submitQuiz } from '../../utils/QuizService';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, CheckCircle2, Trophy, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";

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
    const [loading, setLoading] = useState(true);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [result, setResult] = useState<{ score: number; correctAnswers: number; totalQuestions: number } | null>(null);

    // Loads quiz data on startup based on URL parameter
    useEffect(() => {
        const load = async () => {
            if (!quizId) return;
            setLoading(true);
            const id = parseInt(quizId, 10);
            if (Number.isNaN(id)) {
                setLoading(false);
                return;
            }
            try {
                const data = await fetchQuizById(id);
                if (!data) {
                    setLoading(false);
                    return;
                }
                // Backend returns
                const mapped: IQuiz = {
                    id: data.id,
                    title: data.title,
                    description: data.description || 'No description provided.',
                    answerOptions: [], // Not used at quiz level
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
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [quizId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading quiz...</p>
            </div>
        );
    }

    // Handles error if quiz not found
    if (!currentQuiz) {
        return (
            <div className="container mx-auto px-4 py-8 mt-20">
                <Alert variant="destructive" className="max-w-md mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Oops! Quiz not found</AlertTitle>
                    <AlertDescription>
                        Could not load quiz with ID: {quizId}
                    </AlertDescription>
                    <Button 
                        variant="destructive" 
                        className="mt-4"
                        onClick={() => navigate('/QuizList')}
                    >
                        Back to Quiz List
                    </Button>
                </Alert>
            </div>
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
                    if (scoreFromServer === 0 && Object.keys(userAnswers).length > 0 && correctFromServer !== 0) {
                        console.warn('Server returned score = 0 when there should be a score; debugging details', {
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
                setSubmitError(err.message || 'Could not submit quiz.');
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

    const calculateTotalPoints = () => {
        return currentQuiz.questions.reduce((sum, q) => sum + q.points, 0);
    };

    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const renderQuestion = () => (
        <>
            <div className="mb-6">
                <Progress value={progress} className="h-2" />
            </div>

            <CardTitle className="text-2xl mb-6 text-center">
                {currentQuestion.questionText}
            </CardTitle>

            <div className="grid gap-3 mb-6">
                {currentQuestion.answerOptions.map(option => (
                    <Button
                        key={option.id}
                        variant={userAnswers[currentQuestion.id] === option.id ? "default" : "outline"}
                        size="lg"
                        onClick={() => handleAnswerSelect(option.id)}
                        className={`justify-start text-left h-auto py-4 px-6 ${
                            userAnswers[currentQuestion.id] === option.id
                                ? "bg-primary/80 border-2 border-foreground"
                                : "bg-muted! hover:bg-muted/50! cursor-pointer"
                        }`}
                    >
                        {option.text}
                    </Button>
                ))}
            </div>

            <div className="flex justify-between items-center mt-6">
                <Button
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Question</p>
                    <p className="font-semibold">
                        {currentQuestionIndex + 1} of {totalQuestions}
                    </p>
                </div>

                <Button
                    onClick={handleNext}
                    disabled={userAnswers[currentQuestion.id] === undefined || isSubmitting}
                    className="gap-2 bg-primary hover:bg-primary/90"
                >
                    {currentQuestionIndex === totalQuestions - 1 ? (
                        isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Quiz'
                        )
                    ) : (
                        <>
                            Next
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </>
    );

    const renderResults = () => {
        if (isSubmitting) {
            return (
                <div className="text-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <h4 className="text-xl font-semibold">Submitting your answers...</h4>
                </div>
            );
        }
        
        if (submitError) {
            return (
                <Alert variant="destructive" className="text-center">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                    <AlertDescription className="text-lg mb-4">{submitError}</AlertDescription>
                    <Button variant="secondary" onClick={() => navigate('/QuizList')}>
                        Back to Quiz List
                    </Button>
                </Alert>
            );
        }
        
        if (!result) {
            return (
                <div className="text-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <h4 className="text-xl font-semibold">Loading results...</h4>
                </div>
            );
        }

        const totalPoints = calculateTotalPoints();
        const finalScore = result.score;
        const scorePercentage = totalPoints > 0 ? (finalScore / totalPoints) * 100 : 0;

        return (
            <div className="text-center p-6">
                <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-4xl font-bold mb-6">Quiz Completed!</h2>
                
                <Alert
                    className={`mb-6 ${
                        scorePercentage >= 70
                            ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"
                            : scorePercentage >= 50
                            ? "border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100"
                            : "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
                    }`}
                >
                    {scorePercentage >= 70 ? (
                        <CheckCircle2 className="h-5 w-5 mx-auto mb-2" />
                    ) : (
                        <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                    )}
                    <AlertTitle className="text-lg mb-2">Your Score</AlertTitle>
                    <AlertDescription>
                        <h3 className="text-3xl font-bold mb-1">
                            {finalScore} of {totalPoints} points
                        </h3>
                        <p className="text-xl">({scorePercentage.toFixed(1)}%)</p>
                    </AlertDescription>
                </Alert>

                <div className="flex flex-wrap gap-3 justify-center">
                    <Button
                        onClick={() => {
                            setCurrentQuestionIndex(0);
                            setUserAnswers({});
                            setShowResults(false);
                            setResult(null);
                            setSubmitError(null);
                        }}
                        className="gap-2 bg-primary hover:bg-primary/90"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Take Quiz Again
                    </Button>
                    
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/QuizList')}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Quiz List
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 mt-20">
            <Card className="max-w-3xl mx-auto shadow-lg">
                <CardHeader className="bg-primary text-primary-foreground text-center">
                    <CardTitle className="text-2xl">{currentQuiz.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {showResults ? renderResults() : renderQuestion()}
                </CardContent>
            </Card>
        </div>
    );
};

export default QuizTaker;