/**
 * Minimal client-side cookie helpers.
 *
 * SSR-friendly: these functions are no-ops on the server.
 */

export function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));

  if (!cookie) return null;
  const value = cookie.slice(name.length + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

type SetClientCookieOptions = {
  maxAgeSeconds?: number;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
};

export function setClientCookie(
  name: string,
  value: string,
  options: SetClientCookieOptions = {}
): void {
  if (typeof document === "undefined") return;

  const { maxAgeSeconds, path = "/", sameSite = "Lax" } = options;
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];

  if (typeof maxAgeSeconds === "number") {
    parts.push(`Max-Age=${Math.floor(maxAgeSeconds)}`);
  }
  parts.push(`Path=${path}`);
  parts.push(`SameSite=${sameSite}`);

  // Required by browsers if SameSite=None; harmless otherwise.
  if (sameSite === "None" && typeof location !== "undefined") {
    if (location.protocol === "https:") parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

export function deleteClientCookie(name: string, path = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=${path}; SameSite=Lax`;
}
