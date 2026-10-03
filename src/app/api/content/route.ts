import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getEditableCopy, sanitizeCopy, saveContent } from "@/lib/content";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getEditableCopy());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const copy = sanitizeCopy(body);
  await saveContent(copy);
  return NextResponse.json(await getEditableCopy());
}
