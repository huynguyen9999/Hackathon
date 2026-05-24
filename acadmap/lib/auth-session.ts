import { isSupabaseConfigured } from "@/lib/env";
import { createServerClient } from "@/lib/supabase";

export type NavAuthState = {
  configured: boolean;
  email: string | null;
};

export async function getNavAuthState(): Promise<NavAuthState> {
  if (!isSupabaseConfigured()) {
    return { configured: false, email: null };
  }

  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();
    return { configured: true, email: data.user?.email ?? null };
  } catch {
    return { configured: true, email: null };
  }
}
