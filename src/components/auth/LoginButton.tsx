"use client";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { signIn } from "@/lib/auth/client";
import type { AuthProvider } from "@/lib/auth/client";
import { useState } from "react";

interface LoginButtonProps {
  provider: AuthProvider;
  label?: string;
  redirectTo?: string;
}

export function LoginButton({
  provider,
  label,
  redirectTo,
}: LoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn(provider, redirectTo);
    } catch (error) {
      logger.error("Sign in error:", error);
      setLoading(false);
    }
  };

  const providerLabels: Record<AuthProvider, string> = {
    google: "使用 Google 登入",
    facebook: "使用 Facebook 登入",
    github: "使用 GitHub 登入",
  };

  return (
    <Button onClick={handleSignIn} disabled={loading} variant="outline">
      {loading ? "登入中..." : label || providerLabels[provider]}
    </Button>
  );
}

export function LoginButtons({ redirectTo }: { redirectTo?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <LoginButton provider="google" redirectTo={redirectTo} />
      <LoginButton provider="github" redirectTo={redirectTo} />
      <LoginButton provider="facebook" redirectTo={redirectTo} />
    </div>
  );
}
