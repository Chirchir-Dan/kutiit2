export async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Cloudflare Secret Key is missing from environment variables.");
  }

  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  
  const result = await fetch(url, {
    body: formData,
    method: "POST",
  });

  const outcome = await result.json();
  
  // Cloudflare returns { success: true } if the token is valid
  return outcome.success;
}