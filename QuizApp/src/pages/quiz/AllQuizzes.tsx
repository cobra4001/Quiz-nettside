// Page showing all available quizzes

import React, { useEffect, useState } from 'react';
import { fetchQuizzes } from '../../utils/QuizService';
import { useAuth } from "../../auth/AuthContext";
import QuizList from '../../components/QuizList';
import { isAdmin } from '../../utils/roleUtils';

const AllQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { user } = useAuth() as any;

  //logging for sjekk av bruker, intern testing, burde slettes
  console.log('Current user in AllQuizzes:', user);
  console.log('Is user admin?', isAdmin(user));
  console.log('User roles:', user ? (Array.isArray(user.role) ? user.role : [user.role]) : 'No user');

  //hent quizzer
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

  // Returner en QuizList
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
    currentUserRole={user?.role as string} // Vil kun ha én, sterkeste rolle
  />
  );
};

export default AllQuizzes;
