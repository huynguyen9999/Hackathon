"use client";

import { useEffect, useState } from "react";

type PlannerRole = "owner" | "advisor" | "viewer";

type PlanMember = {
  planId: string;
  userId: string;
  role: PlannerRole;
  createdAt: string;
};

export type CollaboratorsPanelProps = {
  planId: string | null;
};

export function CollaboratorsPanel({ planId }: CollaboratorsPanelProps) {
  const [members, setMembers] = useState<PlanMember[]>([]);
  const [myRole, setMyRole] = useState<PlannerRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMembers() {
      if (!planId) {
        setMembers([]);
        setMyRole(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/plans/${planId}/members`);
        const body = (await res.json()) as {
          members?: PlanMember[];
          myRole?: PlannerRole;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(body.error ?? "Failed to load collaborators.");
        }

        if (active) {
          setMembers(body.members ?? []);
          setMyRole(body.myRole ?? null);
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
      error?: string;
    };

    if (!res.ok) {
      setError(body.error ?? "Failed to update collaborator.");
      return;
    }

    setMembers(body.members ?? []);
    setMyRole(body.myRole ?? null);
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
      error?: string;
    };

    if (!res.ok) {
      setError(body.error ?? "Failed to remove collaborator.");
      return;
    }

    setMembers(body.members ?? []);
    setMyRole(body.myRole ?? null);
  }

  return (
    <section className="rounded-xl border border-gaucho-blue/15 bg-white p-4 dark:border-gaucho-gold/15 dark:bg-gaucho-blue-dark/30">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gaucho-blue dark:text-gaucho-gold">
        Collaborators
      </h2>

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
              return (
                <div
                  key={member.userId}
                  className="rounded-md bg-slate-50 px-2 py-2 text-xs dark:bg-gaucho-blue-dark/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{member.userId}</p>
                      <p className="text-[10px] text-slate-500">Role: {member.role}</p>
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
