import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext"; // Juster sti etter prosjektet ditt
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

interface IQuiz {
  title: string;
  questions: IQuestion[];
  anwserOptions: IAnswerOption[];
}

const QuizCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect til login hvis ikke innlogget
  useEffect(() => {
    if (!user) {
      navigate("/LoginPage", {
        replace: true,
        state: { from: "/quizcreate", message: "Du må logge inn først" }
      });
    }
  }, [user, navigate]);

  // Ikke vis siden hvis ikke bruker er logget inn
  if (!user) return null;

  const [quizTitle, setQuizTitle] = useState<string>('');
  const [questions, setQuestions] = useState<IQuestion[]>([
    {
      id: 1,
      questionText: '',
      points: 10,
      answerOptions: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
      ]
    }
  ]);

  // Legg til spørsmål
  const handleAddQuestion = () => {
    const newQuestion: IQuestion = {
      id: questions.length + 1,
      questionText: '',
      points: 10,
      answerOptions: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  // Legg til svaralternativ for et spesifikt spørsmål
  const handleAddAnswerOption = (questionId: number) => {
    const newQuestions = questions.map(q => {
      if (q.id === questionId) {
        if (q.answerOptions.length >= 4) return q;
        const newOption: IAnswerOption = {
          id: q.answerOptions.length + 1,
          text: '',
          isCorrect: false,
        };
        return { ...q, answerOptions: [...q.answerOptions, newOption] };
      }
      return q;
    });
    setQuestions(newQuestions);
  };

  // Oppdater spørsmålstekst
  const handleQuestionTextChange = (questionId: number, text: string) => {
    const newQuestions = questions.map(q =>
      q.id === questionId ? { ...q, questionText: text } : q
    );
    setQuestions(newQuestions);
  };

  // Oppdater poeng for spørsmål
  const handlePointsChange = (questionId: number, points: number) => {
    const newQuestions = questions.map(q =>
      q.id === questionId ? { ...q, points } : q
    );
    setQuestions(newQuestions);
  };

  // Oppdater tekst på svaralternativ
  const handleAnswerTextChange = (questionId: number, optionId: number, text: string) => {
    const newQuestions = questions.map(q => {
      if (q.id === questionId) {
        const newAnswerOptions = q.answerOptions.map(opt =>
          opt.id === optionId ? { ...opt, text } : opt
        );
        return { ...q, answerOptions: newAnswerOptions };
      }
      return q;
    });
    setQuestions(newQuestions);
  };

  // Sett korrekt svar på et spørsmål (radio)
  const handleCorrectAnswerChange = (questionId: number, optionId: number) => {
    const newQuestions = questions.map(q => {
      if (q.id === questionId) {
        const newAnswerOptions = q.answerOptions.map(opt => ({
          ...opt,
          isCorrect: opt.id === optionId,
        }));
        return { ...q, answerOptions: newAnswerOptions };
      }
      return q;
    });
    setQuestions(newQuestions);
  };

  // Submit quiz til backend/service
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newQuiz: IQuiz = {
      title: quizTitle,
      questions,
      anwserOptions: questions.flatMap(q => q.answerOptions),
    };

    try {
      const createdQuiz = await QuizService.createQuiz(newQuiz);
      console.log("Quiz created successfully:", createdQuiz);
      // F.eks. naviger til quizliste eller nullstill form
      navigate("/QuizList");
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-5">
          <h1 className="card-title fw-bold fs-1 text-center mb-3">Create a New Quiz</h1>
          <p className="card-text text-center text-muted mb-5">
            Build your own quiz by adding questions and their correct answers.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Quiz Title */}
            <div className="mb-4">
              <label htmlFor="quizTitle" className="form-label fw-bold">Quiz Title</label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="quizTitle"
                placeholder="Write the name of your quiz here"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                required
              />
            </div>

            <hr className="my-5" />

            {/* Spørsmål */}
            <div className="mb-4">
              <h2 className="fs-3 mb-4">Questions</h2>
              {questions.map((question, index) => (
                <div key={question.id} className="card mb-4 border-0 shadow-sm rounded-3">
                  <div className="card-body">
                    <div className="mb-3">
                      <label htmlFor={`question-${question.id}`} className="form-label fw-bold">
                        Question {index + 1}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`question-${question.id}`}
                        placeholder="Enter your question here"
                        value={question.questionText}
                        onChange={e => handleQuestionTextChange(question.id, e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor={`points-${question.id}`} className="form-label">Points</label>
                      <input
                        type="number"
                        className="form-control w-25"
                        id={`points-${question.id}`}
                        min={1}
                        value={question.points}
                        onChange={e => handlePointsChange(question.id, Number(e.target.value))}
                        required
                      />
                    </div>

                    <h6 className="mt-4 mb-2">Answer Options</h6>
                    {question.answerOptions.map(option => (
                      <div key={option.id} className="input-group mb-2">
                        <div className="input-group-text">
                          <input
                            className="form-check-input mt-0"
                            type="radio"
                            name={`correct-answer-${question.id}`}
                            checked={option.isCorrect}
                            onChange={() => handleCorrectAnswerChange(question.id, option.id)}
                          />
                          <label className="ms-2">Correct</label>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`Answer option ${option.id}`}
                          value={option.text}
                          onChange={e => handleAnswerTextChange(question.id, option.id, e.target.value)}
                          required
                        />
                      </div>
                    ))}

                    {question.answerOptions.length < 4 && (
                      <div className="d-grid mt-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleAddAnswerOption(question.id)}
                        >
                          + Add Answer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="d-grid gap-2 mb-4">
              <button
                type="button"
                className="btn btn-outline-primary btn-lg"
                onClick={handleAddQuestion}
              >
                Add Question
              </button>
            </div>

            <div className="d-grid gap-2 mt-5">
              <button type="submit" className="btn btn-primary btn-lg">Save Quiz</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizCreatePage;
