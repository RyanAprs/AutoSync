"use client";

import { useState } from "react";
import { Loader2, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInviteMember } from "@/hooks/use-board";

type InviteMemberDialogProps = {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InviteMemberDialog({
  boardId,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inviteMember = useInviteMember(boardId);

  function handleClose(val: boolean) {
    if (!val) {
      setEmail("");
      setRole("editor");
      setError(null);
      setSuccess(false);
    }
    onOpenChange(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }

    inviteMember.mutate(
      { email: trimmed, role },
      {
        onSuccess: () => {
          setSuccess(true);
          setEmail("");
          setRole("editor");
          // Auto-close after short delay
          setTimeout(() => handleClose(false), 1500);
        },
        onError: (err) => {
          setError(err.message);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-center">Invite Member</DialogTitle>
          <DialogDescription className="text-center">
            Invite a team member to collaborate on this board.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                <AlertDescription>Invitation sent successfully!</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoFocus
                  disabled={inviteMember.isPending || success}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as "editor" | "viewer")}
                disabled={inviteMember.isPending || success}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Editor</span>
                      <span className="text-xs text-muted-foreground">Can view and edit cards</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Viewer</span>
                      <span className="text-xs text-muted-foreground">Can only view cards</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={inviteMember.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMember.isPending || success}>
              {inviteMember.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {inviteMember.isPending ? "Inviting…" : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
