import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { IAnswerOption, IQuestion, QuizFormProps } from "../types/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Trash2, Plus, X } from "lucide-react";

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

    // Validering, klient
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
    <div className="container mx-auto px-4 py-8 mt-20">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">
            {isUpdate ? "Update Quiz" : "Create a New Quiz"}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {isUpdate
              ? "Edit your quiz by modifying questions and answers."
              : "Build your own quiz by adding questions and their correct answers."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}
          
          {successMsg && (
            <Alert className="mb-6 border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Quiz Title */}
            <div className="space-y-2">
              <Label htmlFor="quizTitle" className="text-base font-semibold">
                Quiz Title
              </Label>
              <Input
                id="quizTitle"
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="text-lg"
                required
              />
            </div>

            {/* Quiz Description */}
            <div className="space-y-2">
              <Label htmlFor="quizDescription" className="text-base font-semibold">
                Quiz Description
              </Label>
              <Textarea
                id="quizDescription"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Enter quiz description"
                rows={3}
                className="text-lg resize-none"
                required
              />
            </div>

            <Separator className="my-6" />

            {/* Questions */}
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <Card key={q.id} className="shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">Question {idx + 1}</CardTitle>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="gap-2 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Question
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter your question here"
                        value={q.questionText}
                        onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`points-${q.id}`} className="font-semibold">
                        Points (max 100)
                      </Label>
                      <Input
                        id={`points-${q.id}`}
                        type="number"
                        min={1}
                        max={100}
                        value={q.points}
                        onChange={(e) => {
                          let value = Number(e.target.value);
                          if (value < 1) value = 1;
                          if (value > 100) value = 100;
                          handlePointsChange(q.id, value);
                        }}
                        className="w-32"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="font-semibold">Answer Options</Label>
                      {q.answerOptions.map((opt, optIdx) => (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2 p-3 rounded-md border transition-colors ${
                            opt.isCorrect
                              ? "bg-green-50 border-green-500 dark:bg-green-950/30 dark:border-green-500"
                              : "bg-card"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Checkbox
                              id={`correct-${q.id}-${opt.id}`}
                              checked={opt.isCorrect}
                              onCheckedChange={() => handleCorrectAnswerChange(q.id, opt.id)}
                            />
                            <Label
                              htmlFor={`correct-${q.id}-${opt.id}`}
                              className="cursor-pointer font-medium"
                            >
                              Correct
                            </Label>
                          </div>
                          
                          <Input
                            type="text"
                            value={opt.text}
                            onChange={(e) =>
                              handleAnswerTextChange(q.id, opt.id, e.target.value)
                            }
                            placeholder={`Answer option ${optIdx + 1}`}
                            className="flex-1"
                          />
                          
                          {q.answerOptions.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveAnswerOption(q.id, opt.id)}
                              className="shrink-0 cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {q.answerOptions.length < 4 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddAnswerOption(q.id)}
                          className="gap-2 bg-button-secondary! hover:bg-button-secondary/80! cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                          Add Answer
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddQuestion}
                className="gap-2 bg-button-secondary! hover:bg-button-secondary/80! cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 cursor-pointer"
              >
                {isSubmitting ? "Saving..." : isUpdate ? "Update Quiz" : "Save Quiz"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizForm;