import React, { useEffect, useState } from "react";
import { Table, Button, Alert, Spinner, Container } from "react-bootstrap";
import { useAuth } from "../../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

interface UserDto {
  id: string; 
  userName: string; 
  email: string | null;
  phoneNumber: string | null;
}

const UserControl: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetches all users from the backend
  const fetchUsers = async () => {
    if (!token) {
        setLoading(false);
        setError("Authentication token is missing.");
        return;
    } 

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/Auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const statusError = res.status === 403 ? "Access Denied. You may not have the necessary permissions." : "Failed to fetch users.";
        throw new Error(statusError);
      }
      
      const data: UserDto[] = await res.json();
      
      const uniqueUsers = data.filter((user, index, self) => 
        index === self.findIndex((u) => u.id === user.id)
      );

      setUsers(uniqueUsers); 
      
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Deletes a specific user by ID
  const handleDelete = async (userId: string, username: string) => {
    if (!token) return;

    if (username.toLowerCase() === "admin") {
        alert("Cannot delete the Admin user.");
        return;
    }

    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete user: ${username}?`
      );
      if (!confirmDelete) return;
      
      // Calls the backend endpoint using the simplified route: /api/Auth/user/{userId}
      const res = await fetch(`${API_URL}/api/Auth/user/${userId}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let errorMessage = "Failed to delete user. Check console for details.";
        
        const text = await res.text();
        if (text) {
            try {
                const errorBody = JSON.parse(text);
                errorMessage = errorBody?.Message || text;
            } catch (e) {
                errorMessage = `Deletion failed: ${res.status} (${res.statusText}).`;
            }
        } else if (res.status === 404) {
            errorMessage = `Error: 404 Not Found. API route was not found.`;
        }

        throw new Error(errorMessage);
      }

      // Update the list by filtering out the deleted user
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      setError(err.message || "Something went wrong during user deletion.");
    }
  };


  if (loading) return <Spinner animation="border" className="m-5" />;

  return (
    <Container className="mt-5">
      <h2 className="mb-4">User Control Panel</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            const uniqueKey = user.id || index; 
            
            return (
              <tr key={uniqueKey}> 
                <td>{user.userName}</td>
                <td>{user.email ?? "-"}</td>
                <td>{user.phoneNumber ?? "-"}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user.id, user.userName)}
                    // Disable deletion for the 'admin' user
                    disabled={user.userName.toLowerCase() === "admin"}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export default UserControl;