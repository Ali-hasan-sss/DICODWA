import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createMessage } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const saved = await createMessage({
      id: `msg-${randomUUID().slice(0, 8)}`,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id: saved.id });
  } catch {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
