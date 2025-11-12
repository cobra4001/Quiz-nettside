import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { fetchMyScores } from "../../utils/QuizService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";

interface QuestionDetail {
  points: number;
  questionText: string;
  allAnswers: string[];
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

interface Score {
  quizTitle: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  questions?: QuestionDetail[];
}

interface GroupedScores {
  [quizTitle: string]: Score[];
}

const MyScores: React.FC = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [groupedScores, setGroupedScores] = useState<GroupedScores>({});
  const [filteredGroupedScores, setFilteredGroupedScores] = useState<GroupedScores>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchScores = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError("");
        
        const data = await fetchMyScores();
        console.log("Fetched scores:", data);
        setScores(data || []);
        
        // Group scores by quiz title
        const grouped = (data || []).reduce((acc: GroupedScores, score: Score) => {
          if (!acc[score.quizTitle]) {
            acc[score.quizTitle] = [];
          }
          acc[score.quizTitle].push(score);
          return acc;
        }, {});
        
        // Sort each group by date (most recent first)
        Object.keys(grouped).forEach(quizTitle => {
          grouped[quizTitle].sort((a: Score, b: Score) => 
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );
        });
        
        setGroupedScores(grouped);
        setFilteredGroupedScores(grouped);
      } catch (err: any) {
        console.error("Error fetching scores:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [user]);

  // Filter scores based on search query
  useEffect(() => {
    if (searchQuery.length >= 3) {
      const filtered: GroupedScores = {};
      Object.keys(groupedScores).forEach(quizTitle => {
        if (quizTitle.toLowerCase().includes(searchQuery.toLowerCase())) {
          filtered[quizTitle] = groupedScores[quizTitle];
        }
      });
      setFilteredGroupedScores(filtered);
    } else {
      setFilteredGroupedScores(groupedScores);
    }
  }, [searchQuery, groupedScores]);

  const toggleRow = (key: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleCard = (quizTitle: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quizTitle)) {
        newSet.delete(quizTitle);
      } else {
        newSet.add(quizTitle);
      }
      return newSet;
    });
  };

  const calculateAverageScore = (scores: Score[]) => {
    if (scores.length === 0) return 0;
    const totalPercentage = scores.reduce((sum, score) => {
      const percentage = score.maxScore > 0 ? (score.score / score.maxScore) * 100 : 0;
      return sum + percentage;
    }, 0);
    return (totalPercentage / scores.length).toFixed(1);
  };

  const getBestScore = (scores: Score[]) => {
    return scores.reduce((best: Score, score: Score) => {
      const currentPercentage = score.maxScore > 0 ? (score.score / score.maxScore) * 100 : 0;
      const bestPercentage = best.maxScore > 0 ? (best.score / best.maxScore) * 100 : 0;
      return currentPercentage > bestPercentage ? score : best;
    }, scores[0]);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Logged In</AlertTitle>
          <AlertDescription>Please log in to view your scores.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const quizTitles = Object.keys(filteredGroupedScores);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">My Quiz Scores</h1>
        
        {scores.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Scores Yet</AlertTitle>
            <AlertDescription>
              No scores found. Take a quiz to see your results here!
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Search Bar */}
            <div className="relative mb-6">
              <Input
                type="text"
                placeholder="Search by quiz title (min 3 characters)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-foreground"
              />
              {searchQuery.length > 0 && searchQuery.length < 3 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Type at least 3 characters to search
                </p>
              )}
              {searchQuery.length >= 3 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Found {quizTitles.length} quiz{quizTitles.length !== 1 ? 'zes' : ''}
                </p>
              )}
            </div>

            {/* Grouped Score Tables */}
            {quizTitles.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No quizzes match your search.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {quizTitles.map((quizTitle) => {
                  const quizScores = filteredGroupedScores[quizTitle];
                  const averageScore = calculateAverageScore(quizScores);
                  const bestScore = getBestScore(quizScores);
                  const bestPercentage = bestScore.maxScore > 0 
                    ? ((bestScore.score / bestScore.maxScore) * 100).toFixed(1)
                    : 0;
                  const isCardExpanded = expandedCards.has(quizTitle);

                  return (
                    <Card key={quizTitle}>
                      <CardHeader 
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => toggleCard(quizTitle)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div>
                              <CardTitle className="text-2xl">{quizTitle}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {quizScores.length} attempt{quizScores.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3 items-center">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Average</p>
                              <Badge variant="outline" className="mt-1">
                                {averageScore}%
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Best</p>
                              <Badge variant="default" className="mt-1">
                                {bestPercentage}%
                              </Badge>
                            </div>
                            {isCardExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {isCardExpanded && (
                        <CardContent>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Attempt</TableHead>
                                  <TableHead>Score</TableHead>
                                  <TableHead>Max Score</TableHead>
                                  <TableHead>Percentage</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead className="text-right">Details</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {quizScores.map((score, idx) => {
                                  const percentage = score.maxScore > 0 
                                    ? ((score.score / score.maxScore) * 100).toFixed(1) 
                                    : 0;
                                  const rowKey = `${quizTitle}-${idx}`;
                                  const isExpanded = expandedRows.has(rowKey);
                                  
                                  return (
                                    <React.Fragment key={rowKey}>
                                      <TableRow>
                                        <TableCell className="font-medium">
                                          #{quizScores.length - idx}
                                        </TableCell>
                                        <TableCell>{score.score}</TableCell>
                                        <TableCell>{score.maxScore}</TableCell>
                                        <TableCell>
                                          <Badge variant={Number(percentage) >= 70 ? "default" : "secondary"}>
                                            {percentage}%
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          {new Date(score.submittedAt).toLocaleString("en-US", { 
                                            dateStyle: "medium",
                                            timeStyle: "short"
                                          })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleRow(rowKey)}
                                            className="gap-2 cursor-pointer"
                                          >
                                            {isExpanded ? (
                                              <>
                                                Hide <ChevronUp className="h-4 w-4" />
                                              </>
                                            ) : (
                                              <>
                                                Show <ChevronDown className="h-4 w-4" />
                                              </>
                                            )}
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                      
                                      {/* Collapsible row for question details */}
                                      {isExpanded && (
                                        <TableRow>
                                          <TableCell colSpan={6} className="p-0 bg-muted/50">
                                            <div className="p-6">
                                              {score.questions && score.questions.length > 0 ? (
                                                <div className="space-y-4">
                                                  <h3 className="text-lg font-semibold mb-4">Question Breakdown</h3>
                                                  {score.questions.map((question, qIdx) => (
                                                    <div 
                                                      key={qIdx} 
                                                      className="p-4 border rounded-lg bg-card space-y-3"
                                                    >
                                                      <div className="flex justify-between items-start gap-4">
                                                        <h4 className="text-base font-medium flex-1">
                                                          Question {qIdx + 1}: {question.questionText}
                                                        </h4>
                                                        <Badge 
                                                          variant={question.isCorrect ? "default" : "destructive"}
                                                          className="shrink-0"
                                                        >
                                                          {question.points} {question.points === 1 ? 'pt' : 'pts'}
                                                        </Badge>
                                                      </div>
                                                      
                                                      <div className="rounded-md border overflow-hidden">
                                                        <Table>
                                                          <TableHeader>
                                                            <TableRow>
                                                              <TableHead>Answer Options</TableHead>
                                                              <TableHead className="text-center w-[200px]">
                                                                Status
                                                              </TableHead>
                                                            </TableRow>
                                                          </TableHeader>
                                                          <TableBody>
                                                            {question.allAnswers.map((answer, aIdx) => {
                                                              const isCorrectAnswer = answer === question.correctAnswer;
                                                              const isUserAnswer = answer === question.userAnswer;
                                                              
                                                              let rowClass = "";
                                                              let statusContent = null;
                                                              
                                                              if (isCorrectAnswer && isUserAnswer) {
                                                                rowClass = "bg-green-50 dark:bg-green-950/30";
                                                                statusContent = (
                                                                  <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    Your answer (Correct)
                                                                  </span>
                                                                );
                                                              } else if (isCorrectAnswer) {
                                                                rowClass = "bg-green-50 dark:bg-green-950/30";
                                                                statusContent = (
                                                                  <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    Correct answer
                                                                  </span>
                                                                );
                                                              } else if (isUserAnswer) {
                                                                rowClass = "bg-red-50 dark:bg-red-950/30";
                                                                statusContent = (
                                                                  <span className="flex items-center gap-1 text-red-700 dark:text-red-400">
                                                                    <XCircle className="h-4 w-4" />
                                                                    Your answer (Wrong)
                                                                  </span>
                                                                );
                                                              } else {
                                                                rowClass = "bg-yellow-50 dark:bg-yellow-950/30";
                                                                statusContent = (
                                                                  <span className="text-muted-foreground text-sm">
                                                                    Wrong answer
                                                                  </span>
                                                                );
                                                              }
                                                              
                                                              return (
                                                                <TableRow key={aIdx} className={rowClass}>
                                                                  <TableCell>{answer}</TableCell>
                                                                  <TableCell className="text-center">
                                                                    <div className="flex justify-center">
                                                                      {statusContent}
                                                                    </div>
                                                                  </TableCell>
                                                                </TableRow>
                                                              );
                                                            })}
                                                          </TableBody>
                                                        </Table>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <Alert>
                                                  <AlertCircle className="h-4 w-4" />
                                                  <AlertDescription>
                                                    No question details available for this attempt.
                                                  </AlertDescription>
                                                </Alert>
                                              )}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyScores;