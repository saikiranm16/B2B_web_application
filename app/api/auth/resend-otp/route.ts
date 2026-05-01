import { createOtp, findUserByContact, normalizeContact } from "@/lib/auth-store";

type ResendOtpBody = {
  contact?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ResendOtpBody;
  const contact = normalizeContact(body.contact);

  if (!contact) {
    return Response.json({ message: "Contact is required" }, { status: 400 });
  }

  const user = findUserByContact(contact);

  if (!user) {
    return Response.json(
      { message: "No account found for this contact" },
      { status: 404 }
    );
  }

  const otp = createOtp(user.id, contact, user.verified ? "login" : "signup");

  return Response.json({
    message: "A new OTP has been sent",
    contact,
    devOtp: otp,
  });
}
