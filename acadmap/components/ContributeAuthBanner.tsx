import { OAuthSignInButtons } from "@/components/OAuthSignInButtons";
import type { NavAuthState } from "@/lib/auth-session";

type ContributeAuthBannerProps = {
  auth: NavAuthState;
};

export function ContributeAuthBanner({ auth }: ContributeAuthBannerProps) {
  if (auth.configured && auth.email) {
    return (
      <div
        className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
        role="status"
      >
        Signed in as <strong className="font-semibold">{auth.email}</strong>.
        You can submit a roadmap below.
      </div>
    );
  }

  if (auth.configured) {
    return (
      <div
        className="mb-6 rounded-xl border border-gaucho-blue/30 bg-gaucho-gold/10 px-4 py-3 text-sm text-gaucho-blue dark:bg-gaucho-blue/30 dark:text-gaucho-gold-light/90"
        role="status"
      >
        <p>
          <strong className="font-semibold">Sign in required.</strong> Sign in
          with GitHub or LinkedIn to submit a roadmap.
        </p>
        <OAuthSignInButtons nextPath="/contribute" className="mt-3 max-w-sm" />
      </div>
    );
  }

  return (
    <div
      className="mb-6 rounded-xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
      role="status"
    >
      Sign in to submit a roadmap. Submissions are temporarily unavailable —
      check back soon.
    </div>
  );
}
