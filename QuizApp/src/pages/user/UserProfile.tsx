import React, { useEffect, useState } from "react";
import { Form, Button, Card, Alert, Container, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { isValidEmail, isValidPhone } from "../../shared/Regex";
import type { UpdateContactDTO } from "../../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile: React.FC = () => {
  const { user, token, logout, updateContact, changePassword, deleteAccount, fetchProfile } = useAuth() as any;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
        navigate("/LoginPage", { state: { message: "Please log in to access your profile.", from: "/UserProfile" } });
        return;
    }
    let mounted = true;
    (async () => {
      try {
        const data = await fetchProfile();
        if (!mounted) return;
        // Fixed: Match the casing from your C# API response
        setUsername(data.username || "");
        setEmail(data.email || "");
        setPhonenumber(data.phonenumber || "");
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !phonenumber) {
      setError("Email and/or phone number cannot be empty.");
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

    setIsSubmitting(true);
    try {
      // Fixed: Pass individual values as per AuthContext signature
      await updateContact( { email, phonenumber } as UpdateContactDTO);
      setSuccess("Contact information updated successfully!");
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const updatePassword = async () => {
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Fixed: Use the context method and add auth header
      await changePassword({ newPassword: password });
      setPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully!");
    } catch (err: any) {
      setError(err.message || "Password change failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteAccount();
      logout();
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setIsSubmitting(false);
      setShowConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5" style={{ maxWidth: 900 }}>
        <p>Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: 900 }}>
      <h2 className="mb-4">User profile</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="g-4">
        <Col md={6}>
          <Card>
            <Card.Header>Account</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control value={username} readOnly />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>Contact</Card.Header>
            <Card.Body>
              <Form onSubmit={update}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    value={phonenumber}
                    onChange={(e) => setPhonenumber(e.target.value)}
                    placeholder="+47 123 45 678"
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Contact'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>Security</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>New password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm new password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="secondary" onClick={updatePassword} disabled={isSubmitting}>
                    {isSubmitting ? 'Changing...' : 'Change password'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card border="danger">
            <Card.Header className="text-danger">Danger zone</Card.Header>
            <Card.Body>
              <p className="text-muted">Deleting your account is permanent and cannot be undone.</p>
              <div className="d-flex justify-content-end">
                <Button variant="outline-danger" onClick={() => setShowConfirmDelete(true)} disabled={isSubmitting}>
                  Delete account
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm account deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This will permanently delete your account and all associated data. Are you sure?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isSubmitting}>
            Yes, delete account
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserProfile;