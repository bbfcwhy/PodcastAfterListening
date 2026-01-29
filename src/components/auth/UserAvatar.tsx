"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "./AuthProvider";

export function UserAvatar() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return null;
  }

  const initials = user.email
    ?.split("@")[0]
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <Avatar>
      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || "User"} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
