import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { IAnswerOption, IQuestion, QuizFormProps } from "../../types/quiz";
import "./QuizList.css";

const QuizForm: React.FC<QuizFormProps> = ({
  initialTitle = "",
  initialDescription = "",
  initialQuestions,
  isUpdate = false,
  onSubmit,
  isSubmitting,
}) => {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState<string>(initialTitle);
  const [quizDescription, setQuizDescription] = useState<string>(initialDescription);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [questions, setQuestions] = useState<IQuestion[]>(
    initialQuestions || [
      {
        id: Date.now(),
        questionText: "",
        points: 1,
        answerOptions: [
          { id: Date.now() + 1, text: "", isCorrect: false },
          { id: Date.now() + 2, text: "", isCorrect: false },
        ],
      },
    ]
  );

  // Update form when initial data changes (for update mode)
  useEffect(() => {
    if (initialTitle) setQuizTitle(initialTitle);
    if (initialDescription) setQuizDescription(initialDescription);
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    }
  }, [initialTitle, initialDescription, initialQuestions]);

  const handleAddQuestion = () => {
    const newQuestion: IQuestion = {
      id: Date.now(),
      questionText: "",
      points: 1,
      answerOptions: [
        { id: Date.now() + 1, text: "", isCorrect: false },
        { id: Date.now() + 2, text: "", isCorrect: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (questionId: number) => {
    if (questions.length <= 1) {
      setErrorMsg("A quiz must have at least one question.");
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleAddAnswerOption = (questionId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.answerOptions.length < 4) {
          const newOption: IAnswerOption = {
            id: Date.now(),
            text: "",
            isCorrect: false,
          };
          return { ...q, answerOptions: [...q.answerOptions, newOption] };
        }
        return q;
      })
    );
  };

  const handleRemoveAnswerOption = (questionId: number, optionId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.answerOptions.length > 2) {
          return {
            ...q,
            answerOptions: q.answerOptions.filter((opt) => opt.id !== optionId),
          };
        }
        return q;
      })
    );
  };

  const handleQuestionTextChange = (questionId: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, questionText: text } : q))
    );
  };

  const handlePointsChange = (questionId: number, points: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, points } : q))
    );
  };

  const handleAnswerTextChange = (
    questionId: number,
    optionId: number,
    text: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newAnswerOptions = q.answerOptions.map((opt) =>
            opt.id === optionId ? { ...opt, text } : opt
          );
          return { ...q, answerOptions: newAnswerOptions };
        }
        return q;
      })
    );
  };

  const handleCorrectAnswerChange = (questionId: number, optionId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newAnswerOptions = q.answerOptions.map((opt) => ({
            ...opt,
            isCorrect: opt.id === optionId,
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
    window.scrollTo(0, 0);

    // Validation
    if (!quizTitle.trim()) {
      setErrorMsg("Quiz title is required.");
      return;
    }
    if (quizTitle.length < 5) {
      setErrorMsg("Quiz title must be at least 5 characters long.");
      return;
    }
    if (!quizDescription.trim()) {
      setErrorMsg("Quiz description is required.");
      return;
    }
    if (quizDescription.length < 10) {
      setErrorMsg("Quiz description must be at least 10 characters long.");
      return;
    }

    for (const [index, q] of questions.entries()) {
      if (!q.questionText.trim()) {
        setErrorMsg(`Question ${index + 1} is empty.`);
        return;
      }
      const filledAnswers = q.answerOptions.filter((a) => a.text.trim());
      if (filledAnswers.length < 2) {
        setErrorMsg(
          `Question ${index + 1} must have at least 2 answer options filled in.`
        );
        return;
      }
      if (!filledAnswers.some((a) => a.isCorrect)) {
        setErrorMsg(`Question ${index + 1} needs one correct answer selected.`);
        return;
      }
    }

    try {
      await onSubmit({
        title: quizTitle.trim(),
        description: quizDescription.trim(),
        questions: questions,
      });
      setSuccessMsg(
        isUpdate
          ? "Quiz updated successfully! Redirecting..."
          : "Quiz created successfully! Redirecting..."
      );
    } catch (error: any) {
      setErrorMsg(error?.message || `Failed to ${isUpdate ? "update" : "create"} quiz`);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-5">
          <h1 className="card-title fw-bold fs-1 text-center mb-3">
            {isUpdate ? "Update Quiz" : "Create a New Quiz"}
          </h1>
          <p className="card-text text-center text-muted mb-5">
            {isUpdate
              ? "Edit your quiz by modifying questions and answers."
              : "Build your own quiz by adding questions and their correct answers."}
          </p>

          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Quiz Title */}
            <div className="mb-4">
              <label className="form-label fw-bold">Quiz Title</label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title"
                required
              />
            </div>

            {/* Quiz Description */}
            <div className="mb-4">
              <label className="form-label fw-bold">Quiz Description</label>
              <textarea
                className="form-control form-control-lg"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Enter quiz description"
                rows={3}
                required
              />
            </div>

            <hr className="my-4" />

            {/* Questions */}
            {questions.map((q, idx) => (
              <div key={q.id} className="card mb-4 p-3 shadow-sm rounded-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Question {idx + 1}</h5>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveQuestion(q.id)}
                    >
                      Delete Question
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter your question here"
                  value={q.questionText}
                  onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                />

                <div className="mb-3">
                  <label className="form-label text-start d-block">Points</label>
                  <input
                    type="number"
                    className="form-control w-25"
                    min={1}
                    max={100}
                    value={q.points}
                    onChange={(e) => {
                      let value = Number(e.target.value);
                      if (value < 1) value = 1;
                      if (value > 100) value = 100;
                      handlePointsChange(q.id, value);
                    }}
                  />
                </div>

                <h6>Answer Options</h6>
                {q.answerOptions.map((opt, optIdx) => (
                  <div key={opt.id} className="input-group mb-2">
                    <div
                      className="input-group-text"
                      style={{ background: opt.isCorrect ? "var(--bs-success)" : "transparent",
                        color: opt.isCorrect ? "white" : "inherit",
                        transition: "background 0.2s ease"
                       }}
                    >
                      <input
                        type="checkbox"
                        name={`correct-answer-${q.id}`}
                        checked={opt.isCorrect}
                        onChange={() => handleCorrectAnswerChange(q.id, opt.id)}
                      />
                      <label className="ms-2">Correct</label>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      value={opt.text}
                      onChange={(e) =>
                        handleAnswerTextChange(q.id, opt.id, e.target.value)
                      }
                      placeholder={`Answer option ${optIdx + 1}`}
                    />
                    {q.answerOptions.length > 2 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleRemoveAnswerOption(q.id, opt.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {q.answerOptions.length < 4 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary mt-2"
                    onClick={() => handleAddAnswerOption(q.id)}
                  >
                    + Add Answer
                  </button>
                )}
              </div>
            ))}

            <div className="d-flex justify-content-center gap-3 mt-5">
              <button
                type="button"
                className="btn btn-outline-dark quiz-answer-button"
                onClick={handleAddQuestion}
              >
                + Add Question
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : isUpdate ? "Update Quiz" : "Save Quiz"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;

