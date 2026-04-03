import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { Resend } from 'resend'; 

// 2. Initialize with your Environment Variable
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Server-side Validation using Zod
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const { name, email, subject, message, honeyPot } = result.data;

    // Extra Bot Check (Honeypot)
    if (honeyPot !== "") {
      return NextResponse.json({ error: "Bot detected" }, { status: 400 });
    }

    // 3. THE LIVE PIPE: Send the email via Resend
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Default for free accounts
      to: 'kutiitadmin@gmail.com', // Replace with YOUR actual Gmail
      subject: `Kutiit: ${subject}`,
      replyTo: email, // This lets you click "Reply" in Gmail to answer the user
      html: `
        <h3>New Inquiry from Kutiit</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>User Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Resend Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}