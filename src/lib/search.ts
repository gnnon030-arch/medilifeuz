// Kuchli qidiruv: kirill/lotin transliteratsiya, apostroflar, bo'sh joylar, ko'p so'zli so'rov.

const CYR_TO_LAT: Array<[RegExp, string]> = [
  [/щ/g, "sh"], [/ш/g, "sh"], [/ч/g, "ch"], [/ц/g, "ts"], [/ю/g, "yu"], [/я/g, "ya"],
  [/ё/g, "yo"], [/ж/g, "j"], [/х/g, "x"], [/ҳ/g, "h"], [/ғ/g, "g"], [/қ/g, "q"],
  [/ў/g, "o"], [/э/g, "e"], [/ъ/g, ""], [/ь/g, ""], [/а/g, "a"], [/б/g, "b"],
  [/в/g, "v"], [/г/g, "g"], [/д/g, "d"], [/е/g, "e"], [/з/g, "z"], [/и/g, "i"],
  [/й/g, "y"], [/к/g, "k"], [/л/g, "l"], [/м/g, "m"], [/н/g, "n"], [/о/g, "o"],
  [/п/g, "p"], [/р/g, "r"], [/с/g, "s"], [/т/g, "t"], [/у/g, "u"], [/ф/g, "f"],
  [/ы/g, "i"],
];

/** Qidiruv uchun matnni bir xil ko'rinishga keltiradi (lotin harflarga). */
export function normalizeSearch(input: string | null | undefined): string {
  let s = (input ?? "").toString().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  for (const [re, rep] of CYR_TO_LAT) s = s.replace(re, rep);
  s = s
    .replace(/['’‘`ʻʼ"]/g, "")
    .replace(/ch/g, "c")
    .replace(/sh/g, "s")
    .replace(/ts/g, "s")
    .replace(/kh/g, "x")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return s;
}

/** Har bir so'z (token) mos kelsa true. Bo'sh so'rov hammasini o'tkazadi. */
export function matchesSearch(query: string, ...fields: Array<string | null | undefined>): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  const hay = fields.map((f) => normalizeSearch(f)).join(" ");
  return q.split(" ").every((tok) => hay.includes(tok));
}
