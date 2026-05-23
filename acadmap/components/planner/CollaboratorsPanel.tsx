"use client";

import { useEffect, useState } from "react";

type PlannerRole = "owner" | "advisor" | "viewer";

type PlanMember = {
  planId: string;
  userId: string;
  role: PlannerRole;
  createdAt: string;
  displayName?: string;
};

export type CollaboratorsPanelProps = {
  planId: string | null;
};

function displayMemberName(member: PlanMember): string {
  if (member.displayName?.trim()) return member.displayName.trim();
  return `${member.userId.slice(0, 8)}...`;
}

function roleChipClass(role: PlannerRole): string {
  if (role === "owner") {
    return "bg-gaucho-gold/20 text-gaucho-blue ring-1 ring-gaucho-gold/40 dark:text-gaucho-gold-light";
  }
  if (role === "advisor") {
    return "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300";
  }
  return "bg-slate-200 text-slate-700 ring-1 ring-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600";
}

export function CollaboratorsPanel({ planId }: CollaboratorsPanelProps) {
  const [members, setMembers] = useState<PlanMember[]>([]);
  const [myRole, setMyRole] = useState<PlannerRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const res = await fetch("/api/planner/profile");
        const body = (await res.json()) as {
          profile?: { displayName?: string } | null;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(body.error ?? "Failed to load profile.");
        }

        if (active) {
          setDisplayName(body.profile?.displayName ?? "");
        }
      } catch {
        // optional UX enhancement; ignore profile fetch errors
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMembers() {
      if (!planId) {
        setMembers([]);
        setMyRole(null);
        setCurrentUserId(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/plans/${planId}/members`);
        const body = (await res.json()) as {
          members?: PlanMember[];
          myRole?: PlannerRole;
          currentUserId?: string;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(body.error ?? "Failed to load collaborators.");
        }

        if (active) {
          setMembers(body.members ?? []);
          setMyRole(body.myRole ?? null);
          setCurrentUserId(body.currentUserId ?? null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load collaborators.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMembers();

    return () => {
      active = false;
    };
  }, [planId]);

  async function saveProfile() {
    setProfileSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/planner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });

      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to save profile name.");
      }

      if (currentUserId) {
        setMembers((prev) =>
          prev.map((member) =>
            member.userId === currentUserId
              ? { ...member, displayName: displayName.trim() || undefined }
              : member,
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile name.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function updateMember(targetUserId: string, role: "advisor" | "viewer") {
    if (!planId) return;
    setError(null);

    const res = await fetch(`/api/plans/${planId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, role }),
    });

    const body = (await res.json()) as {
      members?: PlanMember[];
      myRole?: PlannerRole;
      currentUserId?: string;
      error?: string;
    };

    if (!res.ok) {
      setError(body.error ?? "Failed to update collaborator.");
      return;
    }

    setMembers(body.members ?? []);
    setMyRole(body.myRole ?? null);
    setCurrentUserId(body.currentUserId ?? null);
  }

  async function removeMember(targetUserId: string) {
    if (!planId) return;
    setError(null);

    const res = await fetch(`/api/plans/${planId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, remove: true }),
    });

    const body = (await res.json()) as {
      members?: PlanMember[];
      myRole?: PlannerRole;
      currentUserId?: string;
      error?: string;
    };

    if (!res.ok) {
      setError(body.error ?? "Failed to remove collaborator.");
      return;
    }

    setMembers(body.members ?? []);
    setMyRole(body.myRole ?? null);
    setCurrentUserId(body.currentUserId ?? null);
  }

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-4 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
        Collaborators
      </h2>

      <div className="mt-2 flex gap-2">
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Your display name"
          className="w-full rounded-md border border-gaucho-blue/15 bg-white px-2 py-2 text-xs dark:border-gaucho-gold/20 dark:bg-gaucho-blue-dark/50"
        />
        <button
          type="button"
          onClick={saveProfile}
          disabled={profileSaving}
          className="rounded-md border border-gaucho-blue/20 px-2 py-1 text-[11px] font-semibold text-gaucho-blue dark:border-gaucho-gold/20 dark:text-gaucho-gold-light"
        >
          {profileSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {!planId ? (
        <p className="mt-2 text-xs text-slate-500">Save plan first to manage collaborators.</p>
      ) : loading ? (
        <p className="mt-2 text-xs text-slate-500">Loading collaborators...</p>
      ) : (
        <div className="mt-3 space-y-2">
          {members.length === 0 ? (
            <p className="text-xs text-slate-500">No collaborators yet.</p>
          ) : (
            members.map((member) => {
              const canManage = myRole === "owner" && member.role !== "owner";
              const isCurrentUser = currentUserId === member.userId;
              return (
                <div
                  key={member.userId}
                  className="rounded-md bg-slate-50 px-2 py-2 text-xs dark:bg-gaucho-blue-dark/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {displayMemberName(member)}{isCurrentUser ? " (you)" : ""}
                      </p>
                      <p className="mt-1">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleChipClass(member.role)}`}>
                          {member.role}
                        </span>
                      </p>
                    </div>
                    {canManage ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateMember(member.userId, "advisor")}
                          className="rounded border border-gaucho-blue/20 px-2 py-1 text-[10px] text-gaucho-blue dark:border-gaucho-gold/20 dark:text-gaucho-gold-light"
                        >
                          advisor
                        </button>
                        <button
                          type="button"
                          onClick={() => updateMember(member.userId, "viewer")}
                          className="rounded border border-gaucho-blue/20 px-2 py-1 text-[10px] text-gaucho-blue dark:border-gaucho-gold/20 dark:text-gaucho-gold-light"
                        >
                          viewer
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMember(member.userId)}
                          className="rounded border border-red-500/30 px-2 py-1 text-[10px] text-red-700 dark:text-red-300"
                        >
                          remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {error ? (
        <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </section>
  );
}
