// Yandex Maps JS key is read from the environment (not hardcoded in source).
// This key must be domain-restricted in the Yandex developer console.
export const YANDEX_MAPS_API_KEY: string =
  (import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined) ?? "";
