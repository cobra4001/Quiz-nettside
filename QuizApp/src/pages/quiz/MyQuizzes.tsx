// Page showing the user's quizzes

import React, { useEffect, useState } from 'react';
import { fetchMyQuizzes } from '../../utils/QuizService';
import QuizList from '../../components/QuizList';

const MyQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Retrieve user's quizzes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchMyQuizzes();
        if (!mounted) return;
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message || 'Failed to load your quizzes');
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

  // Returning a QuisList
  return (
    <QuizList
      quizzes={quizzes}
      loading={loading}
      error={error}
      successMsg={successMsg}
      onQuizDeleted={handleQuizDeleted}
      title="My Quizzes"
      emptyMessage="You haven't created any quizzes yet. Create your first quiz!"
      showUpdateButton={true} //both update and delete can be inferred due to fetching using userID
      showDeleteButton={true}
    />
  );
};

export default MyQuizzes;