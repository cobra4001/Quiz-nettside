// Page showing all available quizzes

import React, { useEffect, useState } from 'react';
import type { QuizListProps } from '../../types/quiz';
import { fetchQuizzes } from './QuizService';
import { useAuth } from "../../auth/AuthContext";
import QuizList from './QuizList';

const AllQuizzes: React.FC<QuizListProps> = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { user } = useAuth() as any;

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

  const handleQuizDeleted = (quizId: number) => {
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
    setSuccessMsg("Quiz deleted successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Returns a view using the QuizList component to show all available quizzes
  return (
    <QuizList
      quizzes={quizzes}
      loading={loading}
      error={error}
      successMsg={successMsg}
      onQuizDeleted={handleQuizDeleted}
      title="Available Quizzes"
      emptyMessage="No quizzes yet. Create one!"
      showAdminDelete={true}
      currentUserName={user?.unique_name}
    />
  );
};

export default AllQuizzes;
