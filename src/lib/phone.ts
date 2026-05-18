// Always keep +998 prefix. Strip non-digits from the user input portion.
export function formatPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  // Strip leading 998 (or 998 inside) so we work with only the 9-digit local
  let local = digits;
  if (local.startsWith("998")) local = local.slice(3);
  local = local.slice(0, 9);
  let out = "+998";
  if (local.length > 0) out += " " + local.slice(0, 2);
  if (local.length > 2) out += " " + local.slice(2, 5);
  if (local.length > 5) out += " " + local.slice(5, 7);
  if (local.length > 7) out += " " + local.slice(7, 9);
  return out;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[^\d]/g, "");
  return digits.startsWith("998") && digits.length === 12;
}
