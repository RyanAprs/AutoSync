"use client";

import { useState } from "react";
import { Loader2, UserMinus, ShieldCheck, Eye, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useRemoveMember } from "@/hooks/use-board";

type Member = {
  id: string;
  userId: string;
  role: "owner" | "editor" | "viewer";
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

type BoardMembersListProps = {
  boardId: string;
  members: Member[];
  currentUserId: string;
  isOwner: boolean;
};

function RoleBadge({ role }: { role: Member["role"] }) {
  if (role === "owner") {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
        <Crown className="h-3 w-3" />
        Owner
      </Badge>
    );
  }
  if (role === "editor") {
    return (
      <Badge variant="outline" className="flex items-center gap-1 text-xs">
        <ShieldCheck className="h-3 w-3" />
        Editor
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="flex items-center gap-1 text-xs text-muted-foreground">
      <Eye className="h-3 w-3" />
      Viewer
    </Badge>
  );
}

function MemberAvatar({ member }: { member: Member }) {
  const initials = (member.user.name ?? member.user.email).charAt(0).toUpperCase();
  if (member.user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.user.image}
        alt={member.user.name ?? member.user.email}
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-medium text-white">
      {initials}
    </div>
  );
}

export function BoardMembersList({
  boardId,
  members,
  currentUserId,
  isOwner,
}: BoardMembersListProps) {
  const [confirmingRemoval, setConfirmingRemoval] = useState<Member | null>(null);
  const removeMember = useRemoveMember(boardId);

  function handleRemove() {
    if (!confirmingRemoval) return;
    removeMember.mutate(confirmingRemoval.userId, {
      onSuccess: () => setConfirmingRemoval(null),
      onError: () => setConfirmingRemoval(null),
    });
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {members.map((m) => {
          const isSelf = m.userId === currentUserId;
          const canRemove = isOwner && !isSelf && m.role !== "owner";

          return (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <MemberAvatar member={m} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {m.user.name ?? m.user.email}
                  {isSelf && (
                    <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                  )}
                </p>
                {m.user.name && (
                  <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
                )}
              </div>
              <RoleBadge role={m.role} />
              {canRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmingRemoval(m)}
                  title="Remove member"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <AlertDialog
        open={!!confirmingRemoval}
        onOpenChange={(open) => !open && setConfirmingRemoval(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmingRemoval && (
                <>
                  Remove{" "}
                  <strong>
                    {confirmingRemoval.user.name ?? confirmingRemoval.user.email}
                  </strong>{" "}
                  from this board? They will lose access immediately.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMember.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removeMember.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMember.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
