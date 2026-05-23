import { notFound, redirect } from "next/navigation";

import { getCoeMajorBySlug } from "@/lib/ucsb-coe";
import { ccsMajorHubHref, getUcsbCcsMajorBySlug } from "@/lib/ucsb-ccs";
import { resolveLsSlug } from "@/lib/ucsb-dept-urls";
import { getUcsbLsMajorBySlug, lsMajorHubHref } from "@/lib/ucsb-ls";
import { getSchoolConfig } from "@/lib/schools/registry";
import { coeMajorHubHref } from "@/lib/ucsb-paths";

type PageProps = {
  params: { school: string; major: string };
};

/** Legacy `/schools/ucsb/{major}` → college-specific hub paths. */
export default async function LegacyMajorRedirectPage({ params }: PageProps) {
  const { school, major: majorSlug } = params;

  const config = await getSchoolConfig(school);
  if (!config) {
    notFound();
  }

  const coeMajor = await getCoeMajorBySlug(school, majorSlug);
  if (coeMajor) {
    redirect(coeMajorHubHref(school, majorSlug));
  }

  const lsMajor = await getUcsbLsMajorBySlug(majorSlug);
  if (lsMajor) {
    const canonical = resolveLsSlug(majorSlug);
    redirect(lsMajorHubHref(school, canonical));
  }

  const ccsMajor = await getUcsbCcsMajorBySlug(majorSlug);
  if (ccsMajor) {
    redirect(ccsMajorHubHref(school, majorSlug));
  }

  notFound();
}
