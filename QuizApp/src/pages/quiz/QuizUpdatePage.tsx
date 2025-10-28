import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import * as QuizService from './QuizService';

interface IAnswerOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface IQuestion {
  id: number;
  questionText: string;
  points: number;
  answerOptions: IAnswerOption[];
}

const QuizUpdatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();

  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizDescription, setQuizDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [questions, setQuestions] = useState<IQuestion[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/LoginPage", {
        replace: true,
        state: { from: `/QuizUpdate/${quizId}`, message: "Du må logge inn først" }
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
        
        // Transform the API data to match our interface
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

        setQuizTitle(quizData.title);
        setQuizDescription(quizData.description);
        setQuestions(transformedQuestions);
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

  const addQuestion = () => {
    const newQuestion: IQuestion = {
      id: Date.now(),
      questionText: '',
      points: 10,
      answerOptions: [
        { id: Date.now() + 1, text: '', isCorrect: false },
        { id: Date.now() + 2, text: '', isCorrect: false },
      ]
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const removeQuestion = (questionId: number) => {
    if (questions.length <= 1) {
      alert("A quiz must have at least one question.");
      return;
    }
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const addAnswerOption = (questionId: number) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const newOption: IAnswerOption = {
            id: Date.now(),
            text: '',
            isCorrect: false
          };
          return { ...q, answerOptions: [...q.answerOptions, newOption] };
        }
        return q;
      })
    );
  };

  const removeAnswerOption = (questionId: number, optionId: number) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          if (q.answerOptions.length <= 2) {
            alert("A question must have at least two answer options.");
            return q;
          }
          return { ...q, answerOptions: q.answerOptions.filter(opt => opt.id !== optionId) };
        }
        return q;
      })
    );
  };

  const handleQuestionTextChange = (questionId: number, text: string) => {
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, questionText: text } : q)
    );
  };

  const handlePointsChange = (questionId: number, points: number) => {
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, points } : q)
    );
  };

  const handleAnswerTextChange = (questionId: number, optionId: number, text: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const newAnswerOptions = q.answerOptions.map(opt =>
            opt.id === optionId ? { ...opt, text } : opt
          );
          return { ...q, answerOptions: newAnswerOptions };
        }
        return q;
      })
    );
  };

  const handleCorrectAnswerChange = (questionId: number, optionId: number) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const newAnswerOptions = q.answerOptions.map(opt => ({
            ...opt,
            isCorrect: opt.id === optionId
          }));
          return { ...q, answerOptions: newAnswerOptions };
        }
        return q;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!quizTitle.trim()) {
      setErrorMsg('Quiz title is required.');
      return;
    }
    if (quizTitle.length < 5) {
      setErrorMsg('Quiz title must be at least 5 characters long.');
      return;
    }
    if (!quizDescription.trim()) {
      setErrorMsg('Quiz description is required.');
      return;
    }
    if (quizDescription.length < 10) {
      setErrorMsg('Quiz description must be at least 10 characters long.');
      return;
    }

    const emptyQuestions = questions.filter(q => !q.questionText.trim());
    if (emptyQuestions.length > 0) {
      setErrorMsg('All questions must have text.');
      return;
    }

    for (const question of questions) {
      const emptyAnswers = question.answerOptions.filter(opt => !opt.text.trim());
      if (emptyAnswers.length > 0) {
        setErrorMsg('All answer options must have text.');
        return;
      }
      
      const correctAnswers = question.answerOptions.filter(opt => opt.isCorrect);
      if (correctAnswers.length === 0) {
        setErrorMsg('Each question must have at least one correct answer.');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const quizDto = {
        title: quizTitle,
        description: quizDescription,
        questions: questions.map(q => ({
          questionText: q.questionText,
          points: q.points,
          answers: q.answerOptions.map(opt => ({
            answerText: opt.text,
            isCorrect: opt.isCorrect
          }))
        }))
      };

      await QuizService.updateQuiz(parseInt(quizId!), quizDto);
      window.scrollTo(0, 0);
      setSuccessMsg('Quiz updated successfully!');
      
      setTimeout(() => {
        navigate('/MyQuizzes');
      }, 1500);

    } catch (error: any) {
      console.error('Update failed:', error);
      setErrorMsg(error.message || 'Failed to update quiz. Please try again.');
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

  return (
    
     <div className="container my-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-5">
          <h1 className="card-title fw-bold fs-1 text-center mb-3">Update quiz</h1>
          
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="quizTitle" className="form-label fw-bold">Quiz Title*</label>
              <input
                type="text"
                id="quizTitle"
                className="form-control"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="quizDescription" className="form-label fw-bold">Quiz Description*</label>
              <textarea
                id="quizDescription"
                className="form-control"
                rows={3}
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Enter quiz description"
                required
              />
            </div>

            <h3>Questions</h3>
            {questions.map((question, questionIndex) => (
              <div key={question.id} className="card mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title">Question {questionIndex + 1}</h5>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        Remove Question
                      </button>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Question Text*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={question.questionText}
                      onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                      placeholder="Enter question text"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Points</label>
                    <input
                      type="number"
                      className="form-control"
                      value={question.points}
                      onChange={(e) => handlePointsChange(question.id, parseInt(e.target.value) || 10)}
                      min="1"
                      max="100"
                    />
                  </div>

                  <h6>Answer Options</h6>
                  {question.answerOptions.map((option, optionIndex) => (
                    <div key={option.id} className="input-group mb-2">
                        <div className="input-group-text">
                          <input
                          type="checkbox"
                          name={`correct-${question.id}`}
                          checked={option.isCorrect}
                          onChange={() => handleCorrectAnswerChange(question.id, option.id)}
                        />
                        <label className="ms-2">Correct</label>
                        </div>
                      
                      
                        <input
                          type="text"
                          className="form-control"
                          value={option.text}
                          onChange={(e) => handleAnswerTextChange(question.id, option.id, e.target.value)}
                          placeholder={`Answer option ${optionIndex + 1}`}
                          required
                        />
                      
                      <div className="col-2 ms-2">
                        {question.answerOptions.length > 2 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeAnswerOption(question.id, option.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mt-2"
                    onClick={() => addAnswerOption(question.id)}
                  >
                    Add Answer Option
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-secondary mb-4"
              onClick={addQuestion}
            >
              Add Question
            </button>

            <div className="d-flex gap-2 justify-content-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating Quiz...' : 'Update Quiz'}
              </button>
              
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/MyQuizzes')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizUpdatePage;