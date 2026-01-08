import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";
import type { LoginDto } from "../types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Show message from other internal pages
  useEffect(() => {
    const state = location.state as { message?: string; from?: string };
    if (state?.message) {
      setError(state.message);
    }
  }, [location.state]);

  // Handling, login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation on client side
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
      navigate("/HomePage", { replace: true });
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  // Navigation to user creation page
  const handleCreateUser = () => {
    navigate("/CreateUser");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-md text-center text-muted-foreground">
            Login to access your quizzes and scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="mb-2">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
              >
                Login
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full mt-2 cursor-pointer"
                onClick={handleCreateUser}
              >
                Create Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;