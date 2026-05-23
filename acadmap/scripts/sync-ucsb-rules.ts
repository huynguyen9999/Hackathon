import { promises as fs } from "fs";
import path from "path";

import { getUcsbConnector } from "@/lib/integrations/ucsb/connector";

async function validateRuleDataset(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;

  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath} must be an array.`);
  }

  for (const [index, row] of parsed.entries()) {
    if (!Array.isArray(row.mapped_course_codes)) {
      throw new Error(`${filePath} row ${index} missing mapped_course_codes[]`);
    }
  }

  return parsed.length;
}

async function main() {
  const root = path.join(process.cwd(), "data", "ucsb", "rules");
  const apPath = path.join(root, "ap-credit-rules.json");
  const transferPath = path.join(root, "transfer-credit-rules.json");

  const [apCount, transferCount] = await Promise.all([
    validateRuleDataset(apPath),
    validateRuleDataset(transferPath),
  ]);

  const connector = getUcsbConnector();
  const creditRules = await connector.getCreditRules();

  console.log("Validated UCSB rules datasets");
  console.log(`AP rows: ${apCount}`);
  console.log(`Transfer rows: ${transferCount}`);
  console.log(`Connector AP rows: ${creditRules.apRules.length}`);
  console.log(`Connector transfer rows: ${creditRules.transferRules.length}`);
}

main().catch((error) => {
  console.error("[sync-ucsb-rules]", error);
  process.exitCode = 1;
});
