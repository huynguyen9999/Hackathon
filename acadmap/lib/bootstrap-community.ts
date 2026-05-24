import { createAdminClient } from "@/lib/supabase-admin";

export type CommunityBootstrapResult = {
  userId: string | null;
  promoted: boolean;
  announcementsInserted: number;
  questionInserted: boolean;
  message: string;
};

export async function runCommunityBootstrap(): Promise<CommunityBootstrapResult> {
  const supabase = createAdminClient();

  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 5 });

  if (usersError) {
    throw new Error(usersError.message);
  }

  const users = usersData.users ?? [];
  if (users.length === 0) {
    return {
      userId: null,
      promoted: false,
      announcementsInserted: 0,
      questionInserted: false,
      message:
        "No auth users found. Sign in at /auth/sign-in?next=/schools/ucla, then re-run bootstrap.",
    };
  }

  const sorted = [...users].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const user = sorted[0];
  const userId = user.id;
  const displayName =
    user.email?.split("@")[0]?.trim() ||
    user.user_metadata?.full_name?.toString() ||
    "maintainer";

  const { error: profileError } = await supabase.from("user_profiles").upsert(
    {
      user_id: userId,
      display_name: displayName,
      school_short_name: "ucla",
      is_maintainer: true,
    },
    { onConflict: "user_id" },
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  const announcements = [
    {
      school_short_name: "ucla",
      title: "Spring 2026 curriculum update",
      body: "EC ENGR 131A is now a prerequisite for EC ENGR 152B. See the Samueli Announcement PDF.",
      pinned: true,
      author_id: userId,
    },
    {
      school_short_name: "ucsb",
      title: "Spring 2026 curriculum change",
      body: "ECE 130 is now a prerequisite for ECE 153 per the 25-26 GEAR update.",
      pinned: true,
      author_id: userId,
    },
  ];

  let announcementsInserted = 0;
  for (const row of announcements) {
    const { count } = await supabase
      .from("school_announcements")
      .select("id", { count: "exact", head: true })
      .eq("school_short_name", row.school_short_name)
      .eq("title", row.title);

    if ((count ?? 0) > 0) continue;

    const { error } = await supabase.from("school_announcements").insert(row);
    if (error) {
      throw new Error(error.message);
    }
    announcementsInserted++;
  }

  const { count: questionCount } = await supabase
    .from("community_questions")
    .select("id", { count: "exact", head: true })
    .eq("school_short_name", "ucla")
    .eq("title", "Is COM SCI 35L really that hard?");

  let questionInserted = false;
  if ((questionCount ?? 0) === 0) {
    const { error: questionError } = await supabase
      .from("community_questions")
      .insert({
        school_short_name: "ucla",
        title: "Is COM SCI 35L really that hard?",
        body: "Heard mixed things about the projects and time commitment.",
        course_code: "COM SCI 35L",
        author_id: userId,
        status: "open",
      });

    if (questionError) {
      throw new Error(questionError.message);
    }
    questionInserted = true;
  }

  return {
    userId,
    promoted: true,
    announcementsInserted,
    questionInserted,
    message: `Bootstrapped maintainer ${userId} (${users.length} user(s) in auth).`,
  };
}
