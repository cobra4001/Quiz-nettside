import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Container, Table, Alert, Spinner } from "react-bootstrap";
import { fetchMyScores } from "../quiz/QuizService";

interface Score {
  quizTitle: string;
  score: number;
  maxScore: number;
  submittedAt: string;
}

const MyScores: React.FC = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            </tr>
          </thead>
          <tbody>
            {/* Calculates the percantage of correct anwsers */}
            {scores.map((score, idx) => {
              const percentage = score.maxScore > 0 ? ((score.score / score.maxScore) * 100).toFixed(1) : 0;
              
              return (
                <tr key={idx}>
                  <td>{score.quizTitle}</td>
                  <td>{score.score}</td>
                  <td>{score.maxScore}</td>
                  <td>{percentage}%</td>
                  <td>{new Date(score.submittedAt).toLocaleString("en-US", { dateStyle: "long" })}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default MyScores;
