import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { LoginDto } from "../types/auth";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { message?: string; from?: string };
    if (state?.message) {
      setError(state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username.length < 3) {
      setError("Please write a username with at least 3 characters.");
      return;
    }
    if (username.length > 20) {
      setError("Please write a username shorter than 20 characters.");
      return;
    }
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    if (password.length < 8) {
      setError("Please write a password with at least 8 characters.");
      return;
    }

    try {
      await login({ username, password } as LoginDto);
      setError(null);

      {/*  const state = location.state as { from?: string };
      if (state?.from) {
        navigate(state.from, { replace: true });
      } else {
        navigate("/HomePage", { replace: true });
      }
*/} //ændret til bare at den altid går til homepage

      navigate("/HomePage", { replace: true });
      

    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  const handleCreateUser = () => {
    navigate("/CreateUser");
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card style={{ minWidth: "350px" }} className="shadow">
        <Card.Body>
          <h2 className="mb-4 text-center">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-2">
              Login
            </Button>
            <Button
              variant="secondary"
              type="button"
              className="w-100"
              onClick={handleCreateUser}
            >
              Create User
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;
