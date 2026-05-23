"use client";

import { useEffect, useState } from "react";

export type CommunitySession = {
  loading: boolean;
  signedIn: boolean;
  isMaintainer: boolean;
  email: string | null;
};

export function useCommunitySession(): CommunitySession {
  const [session, setSession] = useState<CommunitySession>({
    loading: true,
    signedIn: false,
    isMaintainer: false,
    email: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/community/me")
      .then((res) => res.json())
      .then((data: { signedIn?: boolean; isMaintainer?: boolean; email?: string | null }) => {
        if (cancelled) return;
        setSession({
          loading: false,
          signedIn: data.signedIn === true,
          isMaintainer: data.isMaintainer === true,
          email: data.email ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setSession({
            loading: false,
            signedIn: false,
            isMaintainer: false,
            email: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return session;
}
