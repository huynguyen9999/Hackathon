import { ContributePageClient } from "@/app/contribute/ContributePageClient";
import { getNavAuthState } from "@/lib/auth-session";
import { isContributeLive } from "@/lib/env";

export default async function ContributePage() {
  const auth = await getNavAuthState();
  return (
    <ContributePageClient auth={auth} contributeLive={isContributeLive()} />
  );
}
