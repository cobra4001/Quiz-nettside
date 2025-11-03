// Page showing all available quizzes

import React, { useEffect, useState } from 'react';
import { fetchQuizzes } from './QuizService';
import { useAuth } from "../../auth/AuthContext";
import QuizList from './QuizList';
import { isAdmin } from '../../utils/roleUtils';

const AllQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { user } = useAuth() as any;

  console.log('Current user in AllQuizzes:', user);
  console.log('Is user admin?', isAdmin(user));
  console.log('User roles:', user ? (Array.isArray(user.role) ? user.role : [user.role]) : 'No user');
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
      showAdminDelete={isAdmin(user)}
      currentUserName={user?.unique_name}
    />
  );
};

export default AllQuizzes;
