export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function syntheticEmail(phoneDigits: string): string {
  return `${phoneDigits}@phone.medilife.uz`.toLowerCase();
}

export function formatPhoneDisplay(phoneDigits: string): string {
  const local = phoneDigits.replace(/^998/, "");
  return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`.trim();
}
