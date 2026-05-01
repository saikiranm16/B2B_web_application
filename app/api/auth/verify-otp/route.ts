import {
  createToken,
  publicUser,
  recordLogin,
  verifyOtp,
} from "@/lib/auth-store";

type VerifyOtpBody = {
  contact?: string;
  otp?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as VerifyOtpBody;

  if (!body.contact || !body.otp) {
    return Response.json(
      { message: "Contact and OTP are required" },
      { status: 400 }
    );
  }

  if (!/^\d{6}$/.test(body.otp)) {
    return Response.json(
      { message: "OTP must be a 6-digit code" },
      { status: 400 }
    );
  }

  const result = verifyOtp(body.contact, body.otp);

  if (!result.ok) {
    return Response.json({ message: result.message }, { status: 400 });
  }

  result.user.lastLoginAt = new Date().toISOString();
  recordLogin(result.user.role);

  return Response.json({
    message: "OTP verified",
    token: createToken(result.user.id),
    user: publicUser(result.user),
  });
}
