import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { Resend } from 'resend'; 

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function for Turnstile Verification
async function verifyTurnstile(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.error("TURNSTILE_ERROR: Secret key is missing from environment variables.");
    return false;
  }
  
  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.success;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Server-side Validation (Validates types and presence of turnstileToken)
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Now all fields, including turnstileToken, are pulled from the validated result
    const { name, email, subject, message, honeyPot, turnstileToken } = result.data;

    // 2. Honeypot Check
    if (honeyPot !== "") {
      return NextResponse.json({ error: "Bot detected" }, { status: 400 });
    }

    // 3. CLOUDFLARE TURNSTILE CHECK - Server-side verification
    // Zod already confirmed turnstileToken exists, so we verify it with Cloudflare
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
      return NextResponse.json({ error: "Security verification failed" }, { status: 403 });
    }

    // 4. THE LIVE PIPE: Send the email
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'kutiitadmin@gmail.com',
      subject: `Kutiit: ${subject}`,
      replyTo: email,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
          <h3 style="color: #4f46e5; margin-top: 0;">New Inquiry from Kutiit</h3>
          <p style="font-size: 14px; color: #334155;"><strong>Name:</strong> ${name}</p>
          <p style="font-size: 14px; color: #334155;"><strong>User Email:</strong> ${email}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Message:</p>
          <p style="white-space: pre-wrap; color: #1e293b; line-height: 1.6;">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}