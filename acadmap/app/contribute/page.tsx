import { ContributePageClient } from "@/app/contribute/ContributePageClient";
import { getNavAuthState } from "@/lib/auth-session";

export default async function ContributePage() {
  const auth = await getNavAuthState();
  return <ContributePageClient auth={auth} />;
}
