import { notFound, redirect } from "next/navigation";

import { coeMajorHubHref, getUcsbMajorBySlug } from "@/lib/ucsb-coe";
import { getUcsbLsMajorBySlug, lsMajorHubHref } from "@/lib/ucsb-ls";

type PageProps = {
  params: { school: string; major: string };
};

/** Legacy `/schools/ucsb/{major}` → college-specific hub paths. */
export default async function LegacyMajorRedirectPage({ params }: PageProps) {
  const { school, major: majorSlug } = params;

  if (school !== "ucsb") {
    notFound();
  }

  const coeMajor = await getUcsbMajorBySlug(majorSlug);
  if (coeMajor) {
    redirect(coeMajorHubHref(school, majorSlug));
  }

  const lsMajor = await getUcsbLsMajorBySlug(majorSlug);
  if (lsMajor) {
    redirect(lsMajorHubHref(school, majorSlug));
  }

  notFound();
}
