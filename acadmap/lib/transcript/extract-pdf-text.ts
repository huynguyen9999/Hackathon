import { extractText } from "unpdf";

export async function extractPdfText(buffer: ArrayBuffer | Uint8Array): Promise<string> {
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const { text } = await extractText(data, { mergePages: true });
  return text.trim();
}
