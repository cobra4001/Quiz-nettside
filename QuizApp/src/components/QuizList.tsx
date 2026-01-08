// QuizList.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { deleteQuiz } from "../utils/QuizService";
import type { QuizListProps } from "../types/quiz";
import { isAdminRole } from "../utils/roleUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle2, Trash2, Edit, Play } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  loading,
  error,
  successMsg,
  onQuizDeleted,
  title,
  emptyMessage,
  showUpdateButton = false,
  showDeleteButton = false,
  showAdminDelete = false,
  currentUserRole
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [quizToDelete, setQuizToDelete] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { user } = useAuth();

  const navigateOnclick = (quizId: number) => {
    navigate(`/QuizTakingPage/${quizId}`);
  };

  const openDeleteDialog = (quizId: number) => {
    setQuizToDelete(quizId);
    setDeleteDialogOpen(true);
  };

  const handleQuizDeleted = async () => {
    if (quizToDelete === null) return;

    try {
      await deleteQuiz(quizToDelete);
      onQuizDeleted(quizToDelete);
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (error: any) {
      console.error("Could not delete quiz:", error);
      alert(error?.message || "Could not delete quiz.");
      setDeleteDialogOpen(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      quiz.title?.toLowerCase().includes(searchLower) ||
      quiz.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex justify-center min-h-screen p-3">
      <div className="container py-8 mt-20" style={{ maxWidth: "800px" }}>
        <h1 className="text-center font-bold text-4xl md:text-5xl mb-8">
          {title}
        </h1>

        <div className="relative mb-6">
          <Input
            type="text"
            placeholder="Search quizzes by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert className="mb-6 border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        {!loading &&
          !error &&
          filteredQuizzes.length === 0 &&
          quizzes.length === 0 && (
            <Alert className="text-center">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{emptyMessage}</AlertDescription>
            </Alert>
          )}

        {!loading &&
          !error &&
          filteredQuizzes.length === 0 &&
          quizzes.length > 0 && (
            <Alert className="text-center">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No quizzes match your search.</AlertDescription>
            </Alert>
          )}

        {!loading && !error && filteredQuizzes.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {filteredQuizzes.map((quiz: any) => (
              <Card
                key={quiz.id}
                className={`relative shadow-md hover:shadow-lg transition-all duration-200 ${
                  !showUpdateButton && !showDeleteButton
                    ? "cursor-pointer hover:scale-[1.02]"
                    : ""
                }`}
                onClick={
                  !showUpdateButton && !showDeleteButton
                    ? () => navigateOnclick(quiz.id)
                    : undefined
                }
              >
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary" className="text-sm">
                    {quiz.questionCount}{" "}
                    {quiz.questionCount === 1 ? "question" : "questions"}
                  </Badge>
                </div>

                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-2xl font-bold">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateOnclick(quiz.id);
                      }}
                      className="bg-primary hover:bg-primary/90 gap-2 cursor-pointer"
                    >
                      <Play className="h-4 w-4" />
                      Start Quiz
                    </Button>

                    {(showUpdateButton || user?.nameid === quiz.userId) && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/QuizUpdate/${quiz.id}`);
                        }}
                        variant="default"
                        className="gap-2 bg-button-secondary hover:bg-button-secondary/80 text-foreground cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                        Update Quiz
                      </Button>
                    )}

                    {(showDeleteButton || user?.nameid === quiz.userId) && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(quiz.id);
                        }}
                        variant="destructive"
                        className="gap-2 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Quiz
                      </Button>
                    )}

                    {showAdminDelete &&
                      isAdminRole(currentUserRole) &&
                      user?.nameid !== quiz.userId && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(quiz.id);
                          }}
                          variant="destructive"
                          className="gap-2 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this quiz. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuizToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleQuizDeleted}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizList;
