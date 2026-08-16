import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const cleanText = (value: unknown, limit: number) =>
  typeof value === "string" ? value.trim().slice(0, limit) : "";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit the form again." }, { status: 400 });
  }

  if (cleanText(payload.website, 120)) {
    return NextResponse.json({ ok: true });
  }

  const name = cleanText(payload.name, 160);
  const email = cleanText(payload.email, 320).toLowerCase();
  const subject = cleanText(payload.subject, 200);
  const message = cleanText(payload.message, 5000);

  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Add your name, a valid email, and a message." }, { status: 400 });
  }

  try {
    const { error } = await createAdminClient()
      .from("contact_submissions")
      .insert({ name, email, subject: subject || null, message, source: "website" });

    if (error) throw error;
  } catch (error) {
    console.error("Contact submission could not be saved", error);
    return NextResponse.json({ error: "The contact form is not ready yet. Please use WhatsApp." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
