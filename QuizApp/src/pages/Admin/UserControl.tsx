import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { isAdmin } from "../../utils/roleUtils";
import { useNavigate } from "react-router";
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
import { Loader2, AlertCircle, Trash2, UserPlus } from "lucide-react";
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
import { deleteUser, fetchUsers, createMockUser } from "../../utils/AdminService";

interface UserDto {
  id: string;
  userName: string;
  email: string | null;
  phoneNumber: string | null;
  role: string | null;
}

const UserControl: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingMockUser, setCreatingMockUser] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    username: string;
  } | null>(null);

  // Fetch users wrapper
  const loadUsers = async () => {
    if (!token) {
      setLoading(false);
      setError("Authentication token is missing.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const uniqueUsers = await fetchUsers(token);

      setUsers(uniqueUsers);
      setFilteredUsers(uniqueUsers);
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  // Create mock user
  const handleCreateMockUser = async () => {
    if (!token) return;

    try {
      setCreatingMockUser(true);
      setError(null);

      await createMockUser(token);

      // Refresh the user list after creating mock user
      await loadUsers();
    } catch (err: any) {
      console.error("Create mock user error:", err);
      setError(err.message || "Something went wrong while creating mock user.");
    } finally {
      setCreatingMockUser(false);
    }
  };

  useEffect(() => {
    if (!isAdmin(user)) {
      navigate("/forbidden");
    } else {
      loadUsers();
    }
  }, [token]);

  // Filtering of users in the search bar
  useEffect(() => {
    if (searchQuery.length >= 3) {
      const filtered = users.filter(
        (user) =>
          user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phoneNumber?.includes(searchQuery)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  //Method so admin cannot open delete catalaog
  const openDeleteDialog = (user: {
    id: string;
    userName: string | null;
    role: string | null;
  }) => {
    if (user.role === "Admin") {
      setError("Cannot delete an admin user.");
      return;
    }

    setUserToDelete({
      id: user.id,
      username: user.userName ?? "(no username)",
    });

    setDeleteDialogOpen(true);
  };

  //  Deleting with ID
  const handleDelete = async () => {
    if (!token || !userToDelete) return;

    try {
      const data = await deleteUser(userToDelete.id, token);

      const updatedUsers = users.filter((u) => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      setFilteredUsers(
        updatedUsers.filter((u) =>
          searchQuery.length >= 3
            ? u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.phoneNumber?.includes(searchQuery)
            : true
        )
      );

      setMessage(data?.message);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setError(null);
    } catch (err: any) {
      console.error("Delete user error:", err);
      setError(err.message || "Something went wrong during user deletion.");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            User Control Panel
          </h1>
          <Button
            onClick={handleCreateMockUser}
            disabled={creatingMockUser}
            className="gap-2 cursor-pointer"
          >
            {creatingMockUser ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create Mock User
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="mb-6 bg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Input
            type="text"
            placeholder="Search by username, email, or phone (min 3 characters)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-muted-foreground"
          />
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <p className="text-sm text-muted-foreground mt-2">
              Type at least 3 characters to search
            </p>
          )}
          {searchQuery.length >= 3 && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredUsers.length} user
              {filteredUsers.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/5">
                <TableHead className="text-muted-foreground">
                  Username
                </TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-foreground"
                  >
                    {searchQuery.length >= 3
                      ? "No users match your search."
                      : "No users found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => {
                  const uniqueKey = user.id || index;
                  const isAdminUser = user.role === "Admin";

                  return (
                    <TableRow key={uniqueKey}>
                      <TableCell className="font-medium text-foreground">
                        {user.userName}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {user.email ?? "-"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {user.phoneNumber ?? "-"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {" "}
                        {user.role ?? "-"}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                          disabled={isAdminUser}
                          className="gap-2 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the user{" "}
              <span className="font-semibold">{userToDelete?.username}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setUserToDelete(null)}
              className="text-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserControl;