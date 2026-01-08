// Page showing all available quizzes

import React, { useEffect, useState } from 'react';
import { fetchQuizzes } from '../../utils/QuizService';
import { useAuth } from "../../auth/AuthContext";
import QuizList from '../../components/QuizList';
import { isAdmin } from '@/utils/roleUtils';

const AllQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { user } = useAuth() as any;

  //Get quizzes
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

  // Returns a QuizList
  return (
    <QuizList
    quizzes={quizzes}
    loading={loading}
    error={error}
    successMsg={successMsg}
    onQuizDeleted={handleQuizDeleted}
    title="Available Quizzes"
    emptyMessage="No quizzes yet. Create one!"
    showAdminDelete={isAdmin(user)}
    currentUserRole={user?.role as string} // Find the users strongest role
  />
  );
};

export default AllQuizzes;
