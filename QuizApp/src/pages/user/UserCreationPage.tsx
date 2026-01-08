import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import type { RegisterDto } from "../../types/auth";
import { isValidEmail, isValidPhone } from "../../shared/Regex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const UserCreationPage: React.FC = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Simple input validation
    if (!username || !email || !phonenumber || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (username.length < 3) {
      setError("Please write a username with at least 3 characters.");
      return;
    }
    if (username.length > 20) {
      setError("Please write a username shorter than 20 characters.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
     
    if (!isValidPhone(phonenumber)) {
      setError("Please enter a valid Norwegian phone number 4******* or 9*******.");
      return;
    }
    
    if (password.length < 8) {
      setError("Please create a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register({
        username,
        email,
        phonenumber,
        password,
        confirmPassword
      } as RegisterDto);
    } catch (err: any) {
      setError(err.message || "User creation failed.");
      return;
    }

    setSuccess("User created successfully!");
    setUsername("");
    setEmail("");
    setPhonenumber("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">Create your Account</CardTitle>
          <CardDescription className="text-md text-center text-muted-foreground">
            Create your account to track scores and create quizzes!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="mb-2">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                minLength={3}
                maxLength={20}
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="mb-2">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phonenumber" className="mb-2">Phone number</Label>
              <Input
                id="phonenumber"
                type="tel"
                placeholder="Enter phone number"
                maxLength={8}
                value={phonenumber}
                onChange={e => setPhonenumber(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="mb-2">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="mb-2">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 cursor-pointer">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCreationPage;