import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import * as QuizService from '../../utils/QuizService';
import QuizForm from '../../components/QuizForm';
import type { IQuestion } from '../../types/quiz';

const QuizUpdatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();

  const [initialTitle, setInitialTitle] = useState<string>('');
  const [initialDescription, setInitialDescription] = useState<string>('');
  const [initialQuestions, setInitialQuestions] = useState<IQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/LoginPage", {
        replace: true,
        state: { from: `/QuizUpdate/${quizId}`, message: "loggin first" }
      });
      return;
    }

    const loadQuizForEdit = async () => {
      try {
        if (!quizId) {
          setErrorMsg("Quiz ID not found");
          return;
        }
        
        const quizData = await QuizService.fetchQuizForEdit(parseInt(quizId));
        
        // Transform the API data to match interface
        const transformedQuestions: IQuestion[] = quizData.questions.map((q: any) => ({
          id: q.id,
          questionText: q.questionText,
          points: q.points,
          answerOptions: q.answers.map((a: any) => ({
            id: a.id,
            text: a.answerText,
            isCorrect: a.isCorrect
          }))
        }));

        setInitialTitle(quizData.title);
        setInitialDescription(quizData.description);
        setInitialQuestions(transformedQuestions);
      } catch (error: any) {
        console.error("Failed to load quiz:", error);
        setErrorMsg(error.message || "Failed to load quiz for editing");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizForEdit();
  }, [user, navigate, quizId]);

  if (!user) return null;

  const handleSubmit = async (quizData: { title: string; description: string; questions: IQuestion[] }) => {
    setIsSubmitting(true);
    try {
      const quizDto = {
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions.map(q => ({
          questionText: q.questionText,
          points: q.points,
          answers: q.answerOptions.map(opt => ({
            answerText: opt.text,
            isCorrect: opt.isCorrect
          }))
        }))
      };

      await QuizService.updateQuiz(parseInt(quizId!), quizDto);
      navigate('/MyQuizzes');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading quiz for editing...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{errorMsg}</div>
      </div>
    );
  }

  return (
    <QuizForm 
      isUpdate={true}
      initialTitle={initialTitle}
      initialDescription={initialDescription}
      initialQuestions={initialQuestions}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default QuizUpdatePage;