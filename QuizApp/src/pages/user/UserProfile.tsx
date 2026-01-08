import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { isValidEmail, isValidPhone } from "../../shared/Regex";
import type { ChangePasswordDTO, UpdateContactDTO } from "../../types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

const UserProfile: React.FC = () => {
  const { user, logout, updateContact, changePassword, deleteAccount, fetchProfile } = useAuth() as any;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState(""); // state for role
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch profile data
  useEffect(() => {
    if (!user) {
      navigate("/LoginPage", { 
        state: { message: "Please log in to access your profile.", from: "/UserProfile" } 
      });
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const data = await fetchProfile();
        if (!mounted) return;

        setUsername(data.username || "");

        // FIX: Set role to first role from Roles array
        setRole(Array.isArray(data.roles) && data.roles.length > 0 ? data.roles[0] : "");

        setEmail(data.email || "");
        setPhonenumber(data.phonenumber || "");
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Update contact info
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
      await updateContact({ email, phonenumber } as UpdateContactDTO);
      setSuccess("Contact information updated successfully!");
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ oldPassword, newPassword, confirmPassword } as ChangePasswordDTO);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully!");
    } catch (err: any) {
      setError(err.message || "Password change failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm account deletion
  const confirmDelete = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      navigate("/", { state: { message: "Your account has been deleted." } });
      setTimeout(() => logout(), 50) //Vil ikke sende til login-skjerm, som kan skje ved protectedRoute
      await deleteAccount();
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setIsSubmitting(false);
      setShowConfirmDelete(false);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">
          User Profile
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Account Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <Separator className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-2">
                <Label className="font-semibold">Username</Label>
                <p className="text-muted-foreground">{username}</p>
              </div>
              <Separator className="mb-4" />
              <div className="space-y-2">
                <Label className="font-semibold">Role</Label>
                <p className="text-muted-foreground">{role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <form onSubmit={update} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phonenumber}
                    onChange={(e) => setPhonenumber(e.target.value)}
                    maxLength={8}
                    placeholder="12345678"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Contact"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <form onSubmit={updatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword" className="font-semibold">
                    Current Password
                  </Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="font-semibold">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-semibold">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Deleting your account is permanent and cannot be undone.
              </CardDescription>
              <Separator />
            </CardHeader>
            <CardContent>
              {user?.unique_name?.toLowerCase() === "admin" ? (
                <Alert className="bg-warning text-warning-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-warning-foreground">
                    You can't delete the default administator user.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex justify-center">
                  <Button
                    variant="destructive"
                    onClick={() => setShowConfirmDelete(true)}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  >
                    Delete Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Account Deletion</DialogTitle>
              <DialogDescription>
                This will permanently delete your account and all associated
                data. Are you sure?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setShowConfirmDelete(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete Account"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserProfile;
