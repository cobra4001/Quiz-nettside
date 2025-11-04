import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Container, Table, Alert, Spinner, Button, Collapse } from "react-bootstrap";
import { fetchMyScores } from "../quiz/QuizService";
import '../quiz/QuizList.css';

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

const MyScores: React.FC = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchScores = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError("");
        
        const data = await fetchMyScores();
        console.log("Fetched scores:", data);
        setScores(data || []);
      } catch (err: any) {
        console.error("Error fetching scores:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [user]);

  // Toggle row expansion
  const toggleRow = (idx: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  //show errors message if user is not logged in
  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Please log in to view your scores.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  //returns a table showing the users quiz scores
  return (
    <Container className="mt-5">
      <h2 className="mb-4">My Quiz Scores</h2>
      {scores.length === 0 ? (
        <Alert variant="info">
          No scores found. Take a quiz to see your results here!
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Quiz</th>
              <th>Score</th>
              <th>Max Score</th>
              <th>Percentage</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, idx) => {
              const percentage = score.maxScore > 0 ? ((score.score / score.maxScore) * 100).toFixed(1) : 0;
              const isExpanded = expandedRows.has(idx);
              
              return (
                <React.Fragment key={idx}>
                  <tr>
                    <td>{score.quizTitle}</td>
                    <td>{score.score}</td>
                    <td>{score.maxScore}</td>
                    <td>{percentage}%</td>
                    <td>{new Date(score.submittedAt).toLocaleString("en-US", { dateStyle: "long" })}</td>
                    <td>
                      <Button
                        className="quiz-answer-button"
                        size="sm"
                        onClick={() => toggleRow(idx)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </Button>
                    </td>
                  </tr>
                  
                  {/* Collapsible row for question details */}
                  <tr>
                    <td colSpan={6} className="p-0 border-0">
                      <Collapse in={isExpanded}>
                        <div className="p-3">
                          {score.questions && score.questions.length > 0 ? (
                            <div>
                              <h5 className="mb-3">Question Breakdown</h5>
                              {score.questions.map((question, qIdx) => (
                                <div key={qIdx} className="mb-4 p-3 border rounded">
                                  <h6 className="mb-3 d-flex justify-content-between align-items-center">
                                    <span>Question {qIdx + 1}: {question.questionText}</span>
                                    <span className={`badge ${question.isCorrect ? 'score-success' : 'score-danger' }`}>{question.points} {question.points === 1 ? 'pt' : 'pts'}</span>
                                  </h6>
                                                                    
                                  <Table bordered size="sm" className="mb-0">
                                    <thead>
                                      <tr>
                                        <th>Answer Options</th>
                                        <th style={{ width: "100px" }} className="text-center">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {question.allAnswers.map((answer, aIdx) => {
                                        const isCorrectAnswer = answer === question.correctAnswer;
                                        const isUserAnswer = answer === question.userAnswer;
                                        
                                        let rowClass = "";
                                        let statusBadge = "";
                                        
                                        if (isCorrectAnswer && isUserAnswer) {
                                          rowClass = "score-success";
                                          statusBadge = "✓ Your answer (Correct)";
                                        } else if (isCorrectAnswer) {
                                          rowClass = "score-success";
                                          statusBadge = "✓ Correct answer";
                                        } else if (isUserAnswer) {
                                          rowClass = "score-danger";
                                          statusBadge = "✗ Your answer (Wrong)";
                                        }
                                        else {
                                          rowClass = "score-warning";
                                          statusBadge = "Wrong answer";
                                        }
                                        
                                        return (
                                          <tr key={aIdx}>
                                            <td className={rowClass}>{answer}</td>
                                            <td className={`text-center ${rowClass}`}>
                                              {statusBadge && (
                                                <small><strong>{statusBadge}</strong></small>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </Table>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Alert variant="info" className="mb-0">
                              No question details available for this quiz.
                            </Alert>
                          )}
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default MyScores;