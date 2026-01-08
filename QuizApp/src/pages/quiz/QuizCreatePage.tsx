import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import * as QuizService from "../../utils/QuizService";
import QuizForm from "../../components/QuizForm";
import type { IQuestion } from "../../types/quiz";

const QuizCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/LoginPage", {
        replace: true,
        state: { from: "/quizcreate", message: "You have to login to access this page." },
      });
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSubmit = async (quizData: {
    title: string;
    description: string;
    questions: IQuestion[];
  }) => {
    setIsSubmitting(true);
    try {
      const quizDto = {
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions.map((q) => ({
          questionText: q.questionText.trim(),
          points: q.points,
          answers: q.answerOptions
            .filter((a) => a.text.trim())
            .map((a) => ({ answerText: a.text.trim(), isCorrect: a.isCorrect })),
        })),
      };

      await QuizService.createQuiz(quizDto);
      setTimeout(() => navigate("/QuizList"), 800);
    } catch (error: any) {
      throw new Error(error?.message || "Failed to create quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <QuizForm
      isUpdate={false}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default QuizCreatePage;
