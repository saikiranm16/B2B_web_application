import {
  createOtp,
  createToken,
  findUserByContact,
  normalizeContact,
  publicUser,
  recordLogin,
} from "@/lib/auth-store";

type LoginBody = {
  email?: string;
  phone?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const contact = normalizeContact(body.email || body.phone);

  if (!contact || !body.password) {
    return Response.json(
      { message: "Contact and password are required" },
      { status: 400 }
    );
  }

  const user = findUserByContact(contact);

  if (!user || user.password !== body.password) {
    return Response.json(
      { message: "Invalid email/phone or password" },
      { status: 401 }
    );
  }

  if (!user.verified) {
    const otp = createOtp(user.id, contact, "login");

    return Response.json({
      message: "OTP verification required",
      requiresOtp: true,
      contact,
      devOtp: otp,
    });
  }

  user.lastLoginAt = new Date().toISOString();
  recordLogin(user.role);

  return Response.json({
    message: "Login successful",
    token: createToken(user.id),
    user: publicUser(user),
  });
}
