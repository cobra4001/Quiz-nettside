import React, { useState } from "react";
import { Form, Button, Card, Alert, Container } from "react-bootstrap";
import { useAuth } from "../../auth/AuthContext";
import type { RegisterDto } from "../../types/auth";
import { isValidEmail, isValidPhone } from "../../shared/Regex";

const UserCreationPage: React.FC = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
     if (email !== confirmEmail) {
      setError("Emails do not match.");
      return;
    }

      if (!isValidPhone(phonenumber)) {
      setError("Please enter a valid Norwegian phone number 4******* or 9*******.");
      return;
      }
       if (phonenumber !== confirmPhonenumber) {
      setError("Phone numbers do not match.");
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
      confirmEmail,
      phonenumber,
      confirmPhonenumber,
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
    setConfirmEmail("");
    setPhonenumber("");
    setConfirmPhonenumber("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card style={{ minWidth: "350px" }} className="shadow">
        <Card.Body>
          <h2 className="mb-4 text-center">Create User</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                minLength={3}
                maxLength={20}
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Form.Group>
             <Form.Group className="mb-4" controlId="formConfirmEmail">
              <Form.Label>Confirm Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Confirm Email address"
                value={confirmEmail}
                onChange={e => setConfirmEmail(e.target.value)}
                autoComplete="new-Email"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTelephone">
              <Form.Label>Phone number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter Phone number"
                maxLength={8}
                value={phonenumber}
                onChange={e => setPhonenumber(e.target.value)}
                autoComplete="tel"
              />
            </Form.Group>
             <Form.Group className="mb-4" controlId="formConfirmTelephone">
              <Form.Label>Confirm phone number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Confirm phone number"
                maxLength={8}
                value={confirmPhonenumber}
                onChange={e => setConfirmPhonenumber(e.target.value)}
                autoComplete="new-Phone"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100">
              Create Account
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserCreationPage;
