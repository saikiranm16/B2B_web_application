import {
  createOtp,
  getAuthStore,
  normalizeContact,
  publicUser,
} from "@/lib/auth-store";

type RegisterBody = {
  email?: string;
  phone?: string;
  password?: string;
  role?: "buyer" | "supplier";
  entityType?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RegisterBody;
  const contact = normalizeContact(body.email || body.phone);

  if (!contact || !body.password || !body.role || !body.entityType) {
    return Response.json(
      { message: "Contact, password, role and entity type are required" },
      { status: 400 }
    );
  }

  if (body.password.length < 8) {
    return Response.json(
      { message: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const store = getAuthStore();
  const duplicate = store.users.find(
    (user) =>
      normalizeContact(user.email) === contact ||
      normalizeContact(user.phone) === contact
  );

  if (duplicate) {
    return Response.json(
      { message: "An account already exists for this email or phone" },
      { status: 409 }
    );
  }

  const user = {
    id: crypto.randomUUID(),
    email: body.email ? normalizeContact(body.email) : undefined,
    phone: body.phone?.trim(),
    password: body.password,
    role: body.role,
    entityType: body.entityType,
    verified: false,
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  const otp = createOtp(user.id, contact, "signup");

  return Response.json({
    message: "Account created. Verify OTP to continue.",
    contact,
    devOtp: otp,
    user: publicUser(user),
  });
}
