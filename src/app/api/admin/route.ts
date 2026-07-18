import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  isAdminAuthenticated,
  verifyPassword,
} from "@/lib/auth";
import { getArtworks, getMessages, getOrders } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const { password, action } = body as { password?: string; action?: string };

  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }

  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const [artworks, orders, messages] = await Promise.all([
    getArtworks(),
    getOrders(),
    getMessages(),
  ]);

  return NextResponse.json({
    authenticated: true,
    artworks,
    orders,
    messages,
  });
}
