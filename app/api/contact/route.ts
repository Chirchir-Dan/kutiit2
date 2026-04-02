import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Server-side Validation using Zod
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const { name, email, subject, message, honeyPot } = result.data;

    // 2. Extra Bot Check (Honeypot)
    if (honeyPot !== "") {
      return NextResponse.json({ error: "Bot detected" }, { status: 400 });
    }

    // 3. Successful Validation Logic
    // Here you would integrate Resend or simply log for now
    console.log(`Verified Inquiry from ${name}: ${message}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}