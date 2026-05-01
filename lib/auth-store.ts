export type UserRole = "buyer" | "supplier";

export type MarketplaceUser = {
  id: string;
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  entityType: string;
  verified: boolean;
  createdAt: string;
  lastLoginAt?: string;
};

type PendingOtp = {
  contact: string;
  code: string;
  purpose: "signup" | "login";
  userId: string;
  expiresAt: number;
};

type AuthStore = {
  users: MarketplaceUser[];
  otps: PendingOtp[];
  stats: {
    totalLogins: number;
    supplierLogins: number;
    buyerLogins: number;
  };
};

declare global {
  var __devbAuthStore: AuthStore | undefined;
}

const OTP_CODE = "123456";
const OTP_TTL_MS = 5 * 60 * 1000;

function createStore(): AuthStore {
  const now = new Date().toISOString();

  return {
    users: [
      {
        id: "demo-buyer",
        email: "buyer@example.com",
        password: "password123",
        role: "buyer",
        entityType: "business",
        verified: true,
        createdAt: now,
      },
      {
        id: "demo-supplier",
        email: "supplier@example.com",
        password: "password123",
        role: "supplier",
        entityType: "company",
        verified: true,
        createdAt: now,
      },
    ],
    otps: [],
    stats: {
      totalLogins: 0,
      supplierLogins: 0,
      buyerLogins: 0,
    },
  };
}

export function getAuthStore() {
  if (!globalThis.__devbAuthStore) {
    globalThis.__devbAuthStore = createStore();
  }

  return globalThis.__devbAuthStore;
}

export function normalizeContact(contact?: string) {
  return contact?.trim().toLowerCase() ?? "";
}

export function publicUser(user: MarketplaceUser) {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
}

export function findUserByContact(contact: string) {
  const store = getAuthStore();
  const normalized = normalizeContact(contact);

  return store.users.find(
    (user) =>
      normalizeContact(user.email) === normalized ||
      normalizeContact(user.phone) === normalized
  );
}

export function createOtp(userId: string, contact: string, purpose: PendingOtp["purpose"]) {
  const store = getAuthStore();
  const normalized = normalizeContact(contact);

  store.otps = store.otps.filter((otp) => otp.contact !== normalized);
  store.otps.push({
    userId,
    contact: normalized,
    code: OTP_CODE,
    purpose,
    expiresAt: Date.now() + OTP_TTL_MS,
  });

  return OTP_CODE;
}

export function verifyOtp(contact: string, code: string) {
  const store = getAuthStore();
  const normalized = normalizeContact(contact);
  const pendingOtp = store.otps.find((otp) => otp.contact === normalized);

  if (!pendingOtp) {
    return { ok: false as const, message: "No OTP request found for this contact" };
  }

  if (Date.now() > pendingOtp.expiresAt) {
    store.otps = store.otps.filter((otp) => otp.contact !== normalized);
    return { ok: false as const, message: "OTP expired. Please request a new code." };
  }

  if (pendingOtp.code !== code) {
    return { ok: false as const, message: "Wrong OTP. Please check the code and try again." };
  }

  const user = store.users.find((item) => item.id === pendingOtp.userId);

  if (!user) {
    return { ok: false as const, message: "User not found for this OTP request" };
  }

  user.verified = true;
  store.otps = store.otps.filter((otp) => otp.contact !== normalized);

  return { ok: true as const, user };
}

export function createToken(userId: string) {
  return `devb.${userId}.${Date.now()}`;
}

export function recordLogin(role: UserRole) {
  const store = getAuthStore();

  store.stats.totalLogins += 1;
  if (role === "supplier") {
    store.stats.supplierLogins += 1;
  } else {
    store.stats.buyerLogins += 1;
  }
}
