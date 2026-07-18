import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

const COOKIE_NAME = "dicodwa_admin";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "dicodwa-admin";
}

export function verifyPassword(password: string): boolean {
  const expected = hashPassword(getAdminPassword());
  const actual = hashPassword(password);
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  return hashPassword(`${getAdminPassword()}:session`);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = createSessionToken();
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
