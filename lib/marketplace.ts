"use client";

import { ApiError, apiFetch } from "@/lib/api";

export type UserRole = "BUYER" | "SUPPLIER";
export type EntityType = "INDIVIDUAL" | "SMALL_BUSINESS" | "COMPANY";
export type Tier = "FREE" | "LIMIT";
export type KycStatus = "PENDING" | "APPROVED";
export type SupplierType =
  | "MANUFACTURER"
  | "TRADER"
  | "IMPORTER"
  | "DISTRIBUTOR"
  | "SERVICE_PROVIDER";
export type RequirementBidMode = "SEALED_BID" | "OPEN_ACTION" | "DIRECT_PROPOSAL";
export type RequirementVisibility = "ALL_SUPPLIERS" | "VERIFIED_ONLY";
export type RequirementStatus = "OPEN" | "CLOSED" | "AWARDED";
export type BidStatus = "SUBMITTED" | "SHORTLISTED" | "REJECTED" | "AWARDED";

type ProfileDocument = {
  label: string;
  fileName: string;
};

type DemoUser = {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  entityType: EntityType;
  tier: Tier;
  kycStatus: KycStatus;
  isVerified: boolean;
  fullName: string;
  companyName: string;
  city: string;
  state: string;
  gst: string;
  workOrderTypes: string[];
  supplierType?: SupplierType;
  productCategories: string[];
  reachStates: string[];
  documents: ProfileDocument[];
  onboardingCompleted: boolean;
  profileViews: number;
  createdAt: string;
};

export type MarketplaceSessionUser = {
  id: string;
  email: string;
  role: UserRole;
  tier: Tier;
  kycStatus: KycStatus;
};

export type MarketplaceProfile = {
  id: string;
  email: string;
  role: UserRole;
  entityType: EntityType;
  isVerified: boolean;
  kycStatus: KycStatus;
  tier: Tier;
  fullName: string;
  companyName: string;
  city: string;
  state: string;
  gst: string;
  workOrderTypes: string[];
  onboardingCompleted: boolean;
  profileViews: number;
  createdAt: string;
  buyerProfile?: {
    companyName?: string;
    location?: string;
    gst?: string;
    workOrder?: string;
  } | null;
  supplierProfile?: {
    companyName?: string;
    location?: string;
    gst?: string;
    supplierType?: string;
    yearEstablished?: number;
  } | null;
  supplierType?: SupplierType;
  productCategories?: string[];
  reachStates?: string[];
  documents?: ProfileDocument[];
};

export type RequirementRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  deliveryLocation: string;
  deliveryState: string;
  deadline: string;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetUndisclosed: boolean;
  bidMode: RequirementBidMode;
  visibility: RequirementVisibility;
  specFileName: string;
  createdAt: string;
  status: RequirementStatus;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  buyerBadge: EntityType;
  buyerVerified: boolean;
  contactShield: boolean;
};

export type BidRecord = {
  id: string;
  requirementId: string;
  supplierId: string;
  supplierName: string;
  supplierCompany: string;
  supplierVerified: boolean;
  price: number;
  deliveryDays: number;
  paymentTerms: string;
  advancePercent: number;
  note: string;
  documentName: string;
  createdAt: string;
  status: BidStatus;
};

type StoredMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  readBy: string[];
};

type StoredThread = {
  id: string;
  requirementId: string | null;
  participantIds: string[];
  subject: string;
  shielded: boolean;
  messages: StoredMessage[];
};

type DemoStore = {
  version: number;
  users: DemoUser[];
  requirements: RequirementRecord[];
  bids: BidRecord[];
  threads: StoredThread[];
  otps: Record<string, string>;
};

export type RequirementsFilterState = {
  category: string;
  verifiedOnly: boolean;
  bidMode: string;
  deliveryState: string;
  budgetMin: number;
  budgetMax: number;
};

export type RequirementCreateInput = {
  title: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  deliveryLocation: string;
  deliveryState: string;
  deadline: string;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetUndisclosed: boolean;
  bidMode: RequirementBidMode;
  visibility: RequirementVisibility;
  specFileName: string;
};

export type BidCreateInput = {
  price: number;
  deliveryDays: number;
  paymentTerms: string;
  advancePercent: number;
  note: string;
  documentName: string;
};

export type InboxThread = {
  id: string;
  requirementId: string | null;
  subject: string;
  counterpartName: string;
  counterpartCompany: string;
  counterpartVerified: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string;
  shielded: boolean;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    body: string;
    createdAt: string;
    mine: boolean;
  }[];
};

export type DashboardMetrics = {
  primaryStats: { label: string; value: string; helper: string }[];
  recentRequirements: RequirementRecord[];
  recentBids: BidRecord[];
  inbox: InboxThread[];
  upgradePrompt: boolean;
};

export const CATEGORY_OPTIONS = [
  "Industrial Fasteners",
  "Electrical Components",
  "Packaging Materials",
  "Office Supplies",
  "Chemical Inputs",
  "Raw Materials",
  "Safety Equipment",
  "Facility Services",
  "IT Hardware",
  "Logistics Services",
];

export const INDIA_STATES = [
  "Andhra Pradesh",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

export const WORK_ORDER_OPTIONS = [
  "Raw materials",
  "Packaging",
  "Capex",
  "MRO",
  "Professional services",
];

export const SUPPLIER_TYPE_OPTIONS: SupplierType[] = [
  "MANUFACTURER",
  "TRADER",
  "IMPORTER",
  "DISTRIBUTOR",
  "SERVICE_PROVIDER",
];

export const UNIT_OPTIONS = ["kg", "ton", "unit", "litre", "box", "set", "service"];

const STORAGE_KEY = "procurelink.demo.store.v1";
const DEMO_OTP = "123456";

function nowPlusDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function newId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function encodeBase64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const padded = `${value}${"=".repeat((4 - (value.length % 4 || 4)) % 4)}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return atob(padded);
}

function toDemoToken(user: MarketplaceSessionUser) {
  return `demo.${encodeBase64Url(JSON.stringify(user))}.signature`;
}

function buildProfile(user: DemoUser): MarketplaceProfile {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    entityType: user.entityType,
    isVerified: user.isVerified,
    kycStatus: user.kycStatus,
    tier: user.tier,
    fullName: user.fullName,
    companyName: user.companyName,
    city: user.city,
    state: user.state,
    gst: user.gst,
    workOrderTypes: user.workOrderTypes,
    onboardingCompleted: user.onboardingCompleted,
    profileViews: user.profileViews,
    createdAt: user.createdAt,
    buyerProfile:
      user.role === "BUYER"
        ? {
            companyName: user.companyName,
            location: `${user.city}, ${user.state}`,
            gst: user.gst,
            workOrder: user.workOrderTypes.join(", "),
          }
        : null,
    supplierProfile:
      user.role === "SUPPLIER"
        ? {
            companyName: user.companyName,
            location: `${user.city}, ${user.state}`,
            gst: user.gst,
            supplierType: user.supplierType,
            yearEstablished: 2017,
          }
        : null,
    supplierType: user.supplierType,
    productCategories: user.productCategories,
    reachStates: user.reachStates,
    documents: user.documents,
  };
}

function buildSessionUser(user: DemoUser): MarketplaceSessionUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    tier: user.tier,
    kycStatus: user.kycStatus,
  };
}

function normalizeProfileResponse(input: any): MarketplaceProfile {
  const buyerLocation = String(input?.buyerProfile?.location || "");
  const supplierLocation = String(input?.supplierProfile?.location || "");
  const [buyerCity = "", buyerState = ""] = buyerLocation.split(",").map((item) => item.trim());
  const [supplierCity = "", supplierState = ""] = supplierLocation.split(",").map((item) => item.trim());
  const workOrderTypes = String(input?.buyerProfile?.workOrder || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: String(input?.id || ""),
    email: String(input?.email || ""),
    role: (input?.role || "BUYER") as UserRole,
    entityType: (input?.entityType || "COMPANY") as EntityType,
    isVerified: Boolean(input?.isVerified),
    kycStatus: (input?.kycStatus || "PENDING") as KycStatus,
    tier: (input?.tier || "FREE") as Tier,
    fullName: String(input?.fullName || input?.email?.split?.("@")?.[0] || ""),
    companyName: String(
      input?.companyName ||
        input?.buyerProfile?.companyName ||
        input?.supplierProfile?.companyName ||
        ""
    ),
    city: String(
      input?.city ||
        (input?.role === "BUYER" ? buyerCity : supplierCity)
    ),
    state: String(
      input?.state ||
        (input?.role === "BUYER" ? buyerState : supplierState)
    ),
    gst: String(input?.gst || input?.buyerProfile?.gst || input?.supplierProfile?.gst || ""),
    workOrderTypes,
    onboardingCompleted: Boolean(
      input?.onboardingCompleted ||
        input?.buyerProfile?.companyName ||
        input?.supplierProfile?.companyName
    ),
    profileViews: Number(input?.profileViews || 0),
    createdAt: String(input?.createdAt || new Date().toISOString()),
    buyerProfile: input?.buyerProfile ?? null,
    supplierProfile: input?.supplierProfile ?? null,
    supplierType: input?.supplierType || input?.supplierProfile?.supplierType || undefined,
    productCategories: input?.productCategories || [],
    reachStates: input?.reachStates || [],
    documents: input?.documents || [],
  };
}

function seedStore(): DemoStore {
  const buyerId = newId("user");
  const supplierId = newId("user");
  const supplierTwoId = newId("user");
  const supplierThreeId = newId("user");

  const users: DemoUser[] = [
    {
      id: buyerId,
      email: "buyer@procurelink.demo",
      password: "Demo@123",
      role: "BUYER",
      entityType: "COMPANY",
      tier: "LIMIT",
      kycStatus: "APPROVED",
      isVerified: true,
      fullName: "Anika Rao",
      companyName: "Orbit Manufacturing Pvt Ltd",
      city: "Bengaluru",
      state: "Karnataka",
      gst: "29AABCU9603R1ZX",
      workOrderTypes: ["Raw materials", "Capex", "MRO"],
      productCategories: [],
      reachStates: [],
      documents: [
        { label: "Company PAN", fileName: "orbit-pan.pdf" },
        { label: "GST Certificate", fileName: "orbit-gst.pdf" },
      ],
      onboardingCompleted: true,
      profileViews: 340,
      createdAt: "2025-11-17T08:30:00.000Z",
    },
    {
      id: supplierId,
      email: "supplier@procurelink.demo",
      password: "Demo@123",
      role: "SUPPLIER",
      entityType: "COMPANY",
      tier: "FREE",
      kycStatus: "APPROVED",
      isVerified: true,
      fullName: "Rahul Mehta",
      companyName: "MetalWorks Components",
      city: "Pune",
      state: "Maharashtra",
      gst: "27AAFCM2901H1ZZ",
      workOrderTypes: ["Raw materials", "Packaging"],
      supplierType: "MANUFACTURER",
      productCategories: ["Industrial Fasteners", "Electrical Components"],
      reachStates: ["Maharashtra", "Karnataka", "Gujarat"],
      documents: [
        { label: "MSME Certificate", fileName: "metalworks-msme.pdf" },
        { label: "Factory License", fileName: "metalworks-license.pdf" },
      ],
      onboardingCompleted: true,
      profileViews: 78,
      createdAt: "2025-10-02T10:00:00.000Z",
    },
    {
      id: supplierTwoId,
      email: "vendor@procurelink.demo",
      password: "Demo@123",
      role: "SUPPLIER",
      entityType: "SMALL_BUSINESS",
      tier: "LIMIT",
      kycStatus: "APPROVED",
      isVerified: true,
      fullName: "Priya Sharma",
      companyName: "Axis Allied Supplies",
      city: "Ahmedabad",
      state: "Gujarat",
      gst: "24AASCA4458L1ZI",
      workOrderTypes: ["Raw materials", "Capex"],
      supplierType: "TRADER",
      productCategories: ["Industrial Fasteners", "Packaging Materials"],
      reachStates: ["Gujarat", "Rajasthan", "Maharashtra"],
      documents: [],
      onboardingCompleted: true,
      profileViews: 143,
      createdAt: "2025-09-20T10:00:00.000Z",
    },
    {
      id: supplierThreeId,
      email: "services@procurelink.demo",
      password: "Demo@123",
      role: "SUPPLIER",
      entityType: "COMPANY",
      tier: "LIMIT",
      kycStatus: "PENDING",
      isVerified: false,
      fullName: "Karan Verma",
      companyName: "Summit Industrial Services",
      city: "Faridabad",
      state: "Haryana",
      gst: "06AALCS8823G1Z6",
      workOrderTypes: ["MRO", "Professional services"],
      supplierType: "SERVICE_PROVIDER",
      productCategories: ["Facility Services", "Safety Equipment"],
      reachStates: ["Haryana", "Delhi"],
      documents: [],
      onboardingCompleted: true,
      profileViews: 54,
      createdAt: "2025-08-06T10:00:00.000Z",
    },
  ];

  const requirementOneId = newId("req");
  const requirementTwoId = newId("req");
  const requirementThreeId = newId("req");
  const threadOneId = newId("thread");

  const requirements: RequirementRecord[] = [
    {
      id: requirementOneId,
      title: "Stainless fasteners for assembly line expansion",
      category: "Industrial Fasteners",
      description:
        "Need corrosion-resistant bolts, washers, and nuts for a new assembly line. Preference for BIS-compliant stock and weekly dispatch scheduling.",
      quantity: 8000,
      unit: "kg",
      deliveryLocation: "Peenya Industrial Area",
      deliveryState: "Karnataka",
      deadline: nowPlusDays(4),
      budgetMin: 680000,
      budgetMax: 760000,
      budgetUndisclosed: false,
      bidMode: "SEALED_BID",
      visibility: "VERIFIED_ONLY",
      specFileName: "fasteners-rfq-specs.pdf",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      status: "OPEN",
      buyerId,
      buyerName: "Anika Rao",
      buyerCompany: "Orbit Manufacturing Pvt Ltd",
      buyerBadge: "COMPANY",
      buyerVerified: true,
      contactShield: true,
    },
    {
      id: requirementTwoId,
      title: "Printed corrugated cartons for South dispatch hubs",
      category: "Packaging Materials",
      description:
        "Three carton sizes with two-colour branding. Need moisture-resistant material and staggered delivery across two warehouses.",
      quantity: 120000,
      unit: "unit",
      deliveryLocation: "Hosur Road Warehouses",
      deliveryState: "Tamil Nadu",
      deadline: nowPlusDays(7),
      budgetMin: null,
      budgetMax: null,
      budgetUndisclosed: true,
      bidMode: "OPEN_ACTION",
      visibility: "ALL_SUPPLIERS",
      specFileName: "carton-artwork-specs.pdf",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      status: "OPEN",
      buyerId,
      buyerName: "Anika Rao",
      buyerCompany: "Orbit Manufacturing Pvt Ltd",
      buyerBadge: "COMPANY",
      buyerVerified: true,
      contactShield: false,
    },
    {
      id: requirementThreeId,
      title: "Plant safety signage and PPE restock",
      category: "Safety Equipment",
      description:
        "Quarterly restock of safety helmets, vests, and signage boards for three production blocks. Award expected within 24 hours.",
      quantity: 550,
      unit: "set",
      deliveryLocation: "Bidadi Plant",
      deliveryState: "Karnataka",
      deadline: nowPlusDays(-1),
      budgetMin: 180000,
      budgetMax: 225000,
      budgetUndisclosed: false,
      bidMode: "DIRECT_PROPOSAL",
      visibility: "VERIFIED_ONLY",
      specFileName: "ppe-restock-checklist.xlsx",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      status: "AWARDED",
      buyerId,
      buyerName: "Anika Rao",
      buyerCompany: "Orbit Manufacturing Pvt Ltd",
      buyerBadge: "COMPANY",
      buyerVerified: true,
      contactShield: true,
    },
  ];

  const bids: BidRecord[] = [
    {
      id: newId("bid"),
      requirementId: requirementOneId,
      supplierId,
      supplierName: "Rahul Mehta",
      supplierCompany: "MetalWorks Components",
      supplierVerified: true,
      price: 724000,
      deliveryDays: 11,
      paymentTerms: "45 days",
      advancePercent: 10,
      note: "Can split dispatch into two batches and include mill test certificates.",
      documentName: "metalworks-fasteners-proposal.pdf",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      status: "SHORTLISTED",
    },
    {
      id: newId("bid"),
      requirementId: requirementOneId,
      supplierId: supplierTwoId,
      supplierName: "Priya Sharma",
      supplierCompany: "Axis Allied Supplies",
      supplierVerified: true,
      price: 712500,
      deliveryDays: 14,
      paymentTerms: "30 days",
      advancePercent: 15,
      note: "Ready stock available for 60 percent immediately, balance in five days.",
      documentName: "axis-allied-quote.pdf",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      status: "SUBMITTED",
    },
    {
      id: newId("bid"),
      requirementId: requirementThreeId,
      supplierId: supplierThreeId,
      supplierName: "Karan Verma",
      supplierCompany: "Summit Industrial Services",
      supplierVerified: false,
      price: 198000,
      deliveryDays: 5,
      paymentTerms: "Net 30",
      advancePercent: 0,
      note: "Includes safety signage installation support.",
      documentName: "summit-safety-proposal.pdf",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      status: "AWARDED",
    },
  ];

  const threads: StoredThread[] = [
    {
      id: threadOneId,
      requirementId: requirementOneId,
      participantIds: [buyerId, supplierId],
      subject: "Fasteners RFQ clarification",
      shielded: true,
      messages: [
        {
          id: newId("msg"),
          senderId: buyerId,
          body: "Please confirm whether you can include corrosion test reports with the first dispatch.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          readBy: [buyerId, supplierId],
        },
        {
          id: newId("msg"),
          senderId: supplierId,
          body: "Yes, we can attach the reports and align dispatch to your batch schedule.",
          createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
          readBy: [supplierId],
        },
      ],
    },
  ];

  return {
    version: 1,
    users,
    requirements,
    bids,
    threads,
    otps: {},
  };
}

function ensureStore(): DemoStore {
  if (typeof window === "undefined") {
    return seedStore();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = seedStore();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(stored) as DemoStore;
    if (!parsed.version) {
      throw new Error("Missing store version");
    }
    return parsed;
  } catch {
    const initial = seedStore();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveStore(store: DemoStore) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function updateStore(mutator: (store: DemoStore) => DemoStore) {
  const next = mutator(ensureStore());
  saveStore(next);
  return next;
}

function fallback<T>(value: T, alternate: T) {
  return value ?? alternate;
}

function getDemoUserFromSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem("token");
  if (!token) {
    return null;
  }

  const decoded = decodeSessionToken(token);
  if (!decoded) {
    return null;
  }

  const store = ensureStore();
  return store.users.find((user) => user.id === decoded.id) ?? null;
}

function getUserOrThrow(userId: string, store: DemoStore) {
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

function markThreadRead(thread: StoredThread, userId: string) {
  return {
    ...thread,
    messages: thread.messages.map((message) =>
      message.readBy.includes(userId)
        ? message
        : { ...message, readBy: [...message.readBy, userId] }
    ),
  };
}

function parseLocation(user: DemoUser) {
  return [user.city, user.state].filter(Boolean).join(", ");
}

function createOrGetThread(store: DemoStore, requirement: RequirementRecord, supplier: DemoUser) {
  const existing = store.threads.find(
    (thread) =>
      thread.requirementId === requirement.id &&
      thread.participantIds.includes(requirement.buyerId) &&
      thread.participantIds.includes(supplier.id)
  );

  if (existing) {
    return existing;
  }

  const thread: StoredThread = {
    id: newId("thread"),
    requirementId: requirement.id,
    participantIds: [requirement.buyerId, supplier.id],
    subject: `${requirement.title} discussion`,
    shielded: requirement.contactShield,
    messages: [
      {
        id: newId("msg"),
        senderId: requirement.buyerId,
        body: "Your bid thread is ready. Please use this panel for requirement-specific clarifications.",
        createdAt: new Date().toISOString(),
        readBy: [requirement.buyerId],
      },
    ],
  };

  store.threads.unshift(thread);
  return thread;
}

export function decodeSessionToken(token: string): MarketplaceSessionUser | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }
    return JSON.parse(decodeBase64Url(payload)) as MarketplaceSessionUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("token");
  }
}

export async function loginAccount(email: string, password: string) {
  try {
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", response.token);
    }
    return { token: response.token, demoMode: false };
  } catch (error) {
    const store = ensureStore();
    const user = store.users.find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password
    );

    if (!user) {
      if (error instanceof ApiError && error.status < 500) {
        throw error;
      }
      throw new Error("Invalid credentials");
    }

    if (!user.isVerified) {
      throw new Error("User not verified");
    }

    const token = toDemoToken(buildSessionUser(user));
    window.localStorage.setItem("token", token);
    return { token, demoMode: true };
  }
}

export async function registerAccount(input: {
  email: string;
  password: string;
  role: UserRole;
  entityType: EntityType;
}) {
  try {
    return await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch (error) {
    const store = ensureStore();
    if (store.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("User already exists");
    }

    const created: DemoUser = {
      id: newId("user"),
      email: input.email,
      password: input.password,
      role: input.role,
      entityType: input.entityType,
      tier: "FREE",
      kycStatus: "PENDING",
      isVerified: false,
      fullName: "",
      companyName: "",
      city: "",
      state: "",
      gst: "",
      workOrderTypes: [],
      supplierType: input.role === "SUPPLIER" ? "MANUFACTURER" : undefined,
      productCategories: [],
      reachStates: [],
      documents: [],
      onboardingCompleted: false,
      profileViews: 0,
      createdAt: new Date().toISOString(),
    };

    updateStore((current) => ({
      ...current,
      users: [created, ...current.users],
      otps: { ...current.otps, [input.email.toLowerCase()]: DEMO_OTP },
    }));

    return { message: "User registered. OTP sent.", demoMode: true };
  }
}

export async function verifyOtpCode(email: string, otp: string) {
  try {
    const response = await apiFetch("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", response.token);
    }
    return { token: response.token, demoMode: false };
  } catch {
    const store = ensureStore();
    const storedOtp = store.otps[email.toLowerCase()] ?? DEMO_OTP;
    if (otp !== storedOtp) {
      throw new Error("Invalid OTP");
    }

    const user = store.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error("User not found");
    }

    const nextStore = updateStore((current) => ({
      ...current,
      users: current.users.map((entry) =>
        entry.id === user.id
          ? { ...entry, isVerified: true, kycStatus: fallback(entry.kycStatus, "PENDING") }
          : entry
      ),
      otps: { ...current.otps, [email.toLowerCase()]: DEMO_OTP },
    }));

    const updatedUser = nextStore.users.find((entry) => entry.id === user.id)!;
    const token = toDemoToken(buildSessionUser(updatedUser));
    window.localStorage.setItem("token", token);
    return { token, demoMode: true };
  }
}

export async function resendOtpCode(email: string) {
  try {
    return await apiFetch("/api/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  } catch {
    updateStore((current) => ({
      ...current,
      otps: { ...current.otps, [email.toLowerCase()]: DEMO_OTP },
    }));
    return { message: "OTP resent.", demoMode: true };
  }
}

export async function getCurrentProfile() {
  try {
    return normalizeProfileResponse(await apiFetch("/api/me"));
  } catch (error) {
    const user = getDemoUserFromSession();
    if (!user) {
      throw error;
    }
    return buildProfile(user);
  }
}

export async function saveCurrentProfile(payload: {
  fullName: string;
  companyName: string;
  city: string;
  state: string;
  gst: string;
  workOrderTypes: string[];
  supplierType?: SupplierType;
  productCategories?: string[];
  reachStates?: string[];
  documents?: ProfileDocument[];
  onboardingCompleted?: boolean;
}) {
  try {
    await apiFetch("/api/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch {
    const user = getDemoUserFromSession();
    if (!user) {
      throw new Error("Sign in required");
    }

    updateStore((current) => ({
      ...current,
      users: current.users.map((entry) =>
        entry.id === user.id
          ? {
              ...entry,
              fullName: payload.fullName,
              companyName: payload.companyName,
              city: payload.city,
              state: payload.state,
              gst: payload.gst,
              workOrderTypes: payload.workOrderTypes,
              supplierType: payload.supplierType ?? entry.supplierType,
              productCategories: payload.productCategories ?? entry.productCategories,
              reachStates: payload.reachStates ?? entry.reachStates,
              documents: payload.documents ?? entry.documents,
              onboardingCompleted: payload.onboardingCompleted ?? entry.onboardingCompleted,
            }
          : entry
      ),
    }));
  }

  return getCurrentProfile();
}

export function getSessionUser() {
  if (typeof window === "undefined") {
    return null;
  }
  const token = window.localStorage.getItem("token");
  return token ? decodeSessionToken(token) : null;
}

export function getDemoCredentials() {
  return [
    { role: "Buyer", email: "buyer@procurelink.demo", password: "Demo@123" },
    { role: "Supplier", email: "supplier@procurelink.demo", password: "Demo@123" },
  ];
}

function getCountdownTime(deadline: string) {
  return new Date(deadline).getTime() - Date.now();
}

export function formatCurrency(value: number | null) {
  if (value === null) {
    return "Undisclosed";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string) {
  const diffMs = new Date(value).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

export function formatCountdown(deadline: string) {
  const remaining = getCountdownTime(deadline);
  if (remaining <= 0) {
    return "Closed";
  }
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h left`;
}

export function calculateProfileCompletion(profile: MarketplaceProfile) {
  const checks = [
    profile.fullName,
    profile.companyName,
    profile.city,
    profile.state,
    profile.gst,
    profile.workOrderTypes.length > 0 ? "yes" : "",
    profile.role === "SUPPLIER" ? profile.supplierType : "yes",
    profile.role === "SUPPLIER" ? profile.productCategories?.length : "yes",
    profile.role === "SUPPLIER" ? profile.reachStates?.length : "yes",
    profile.documents?.length ? "yes" : "",
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function getDashboardMetrics(profile: MarketplaceProfile): DashboardMetrics {
  const store = ensureStore();
  const requirements = store.requirements.filter((item) =>
    profile.role === "BUYER" ? item.buyerId === profile.id : item.status === "OPEN"
  );
  const bids = store.bids.filter((item) =>
    profile.role === "BUYER"
      ? requirements.some((requirement) => requirement.id === item.requirementId)
      : item.supplierId === profile.id
  );
  const inbox = getInboxThreads(profile.id);

  const primaryStats =
    profile.role === "BUYER"
      ? [
          {
            label: "Requirements posted",
            value: String(requirements.length),
            helper: `${requirements.filter((item) => item.status === "OPEN").length} active`,
          },
          {
            label: "Connected bids",
            value: String(bids.length),
            helper: `${bids.filter((item) => item.status === "SHORTLISTED").length} shortlisted`,
          },
          {
            label: "Unread messages",
            value: String(inbox.reduce((total, thread) => total + thread.unreadCount, 0)),
            helper: "Inbox updates every 10s",
          },
          {
            label: "Profile views",
            value: String(profile.profileViews || 0),
            helper: "Placeholder metric for now",
          },
        ]
      : [
          {
            label: "Active opportunities",
            value: String(store.requirements.filter((item) => item.status === "OPEN").length),
            helper: "Filtered from supplier feed",
          },
          {
            label: "Bids submitted",
            value: String(bids.length),
            helper: `${bids.filter((item) => item.status === "AWARDED").length} awarded`,
          },
          {
            label: "Inbox touchpoints",
            value: String(inbox.length),
            helper: `${inbox.reduce((total, thread) => total + thread.unreadCount, 0)} unread`,
          },
          {
            label: "Profile views",
            value: String(profile.profileViews || 0),
            helper: "Placeholder metric for now",
          },
        ];

  return {
    primaryStats,
    recentRequirements: requirements.slice(0, 4),
    recentBids: bids.slice(0, 5),
    inbox: inbox.slice(0, 4),
    upgradePrompt: profile.role === "SUPPLIER" && profile.tier === "FREE",
  };
}

export function listRequirements(filters?: Partial<RequirementsFilterState>) {
  const session = getSessionUser();
  const profile = getDemoUserFromSession();
  const store = ensureStore();
  const activeFilters: RequirementsFilterState = {
    category: filters?.category ?? "",
    verifiedOnly: filters?.verifiedOnly ?? false,
    bidMode: filters?.bidMode ?? "",
    deliveryState: filters?.deliveryState ?? "",
    budgetMin: filters?.budgetMin ?? 0,
    budgetMax: filters?.budgetMax ?? 1000000,
  };

  return store.requirements
    .filter((requirement) => {
      if (session?.role === "BUYER" && requirement.buyerId !== session.id) {
        return false;
      }
      if (session?.role === "SUPPLIER" && requirement.status !== "OPEN") {
        return false;
      }
      if (activeFilters.category && requirement.category !== activeFilters.category) {
        return false;
      }
      if (activeFilters.bidMode && requirement.bidMode !== activeFilters.bidMode) {
        return false;
      }
      if (activeFilters.deliveryState && requirement.deliveryState !== activeFilters.deliveryState) {
        return false;
      }
      if (activeFilters.verifiedOnly && !requirement.buyerVerified) {
        return false;
      }
      const budgetFloor = requirement.budgetMin ?? 0;
      const budgetCeiling = requirement.budgetMax ?? activeFilters.budgetMax;
      if (budgetFloor < activeFilters.budgetMin) {
        return false;
      }
      if (!requirement.budgetUndisclosed && budgetCeiling > activeFilters.budgetMax) {
        return false;
      }
      if (
        session?.role === "SUPPLIER" &&
        requirement.visibility === "VERIFIED_ONLY" &&
        !profile?.isVerified
      ) {
        return false;
      }
      return true;
    })
    .map((requirement) => ({
      ...requirement,
      bidCount: store.bids.filter((bid) => bid.requirementId === requirement.id).length,
      saved: false,
    }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function createRequirement(input: RequirementCreateInput) {
  const session = getSessionUser();
  const user = getDemoUserFromSession();
  if (!session || session.role !== "BUYER" || !user) {
    throw new Error("Only buyers can post requirements");
  }

  const requirement: RequirementRecord = {
    id: newId("req"),
    title: input.title,
    category: input.category,
    description: input.description,
    quantity: input.quantity,
    unit: input.unit,
    deliveryLocation: input.deliveryLocation,
    deliveryState: input.deliveryState,
    deadline: input.deadline,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    budgetUndisclosed: input.budgetUndisclosed,
    bidMode: input.bidMode,
    visibility: input.visibility,
    specFileName: input.specFileName || "requirements-spec.pdf",
    createdAt: new Date().toISOString(),
    status: "OPEN",
    buyerId: session.id,
    buyerName: user.fullName || user.email.split("@")[0],
    buyerCompany: user.companyName || "Untitled Company",
    buyerBadge: user.entityType,
    buyerVerified: user.isVerified,
    contactShield: true,
  };

  updateStore((store) => ({
    ...store,
    requirements: [requirement, ...store.requirements],
  }));

  return requirement;
}

export function getRequirementById(id: string) {
  const store = ensureStore();
  const requirement = store.requirements.find((entry) => entry.id === id);
  if (!requirement) {
    return null;
  }

  return {
    ...requirement,
    bids: store.bids
      .filter((bid) => bid.requirementId === id)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
  };
}

export function submitBidForRequirement(requirementId: string, input: BidCreateInput) {
  const session = getSessionUser();
  const user = getDemoUserFromSession();
  if (!session || session.role !== "SUPPLIER" || !user) {
    throw new Error("Only suppliers can submit bids");
  }

  const store = ensureStore();
  const requirement = store.requirements.find((entry) => entry.id === requirementId);
  if (!requirement) {
    throw new Error("Requirement not found");
  }

  if (store.bids.some((bid) => bid.requirementId === requirementId && bid.supplierId === session.id)) {
    throw new Error("You already submitted a bid for this requirement");
  }

  const bid: BidRecord = {
    id: newId("bid"),
    requirementId,
    supplierId: session.id,
    supplierName: user.fullName || user.email.split("@")[0],
    supplierCompany: user.companyName || "Supplier profile pending",
    supplierVerified: user.isVerified,
    price: input.price,
    deliveryDays: input.deliveryDays,
    paymentTerms: input.paymentTerms,
    advancePercent: input.advancePercent,
    note: input.note,
    documentName: input.documentName || "proposal.pdf",
    createdAt: new Date().toISOString(),
    status: "SUBMITTED",
  };

  updateStore((current) => {
    const mutable = { ...current, bids: [bid, ...current.bids], threads: [...current.threads] };
    const thread = createOrGetThread(mutable, requirement, user);
    thread.messages.push({
      id: newId("msg"),
      senderId: session.id,
      body: `Submitted bid at ${formatCurrency(input.price)} with delivery in ${input.deliveryDays} days.`,
      createdAt: new Date().toISOString(),
      readBy: [session.id],
    });
    return mutable;
  });

  return bid;
}

export function updateBidStatus(requirementId: string, bidId: string, status: BidStatus) {
  const session = getSessionUser();
  if (!session || session.role !== "BUYER") {
    throw new Error("Only buyers can manage bids");
  }

  const nextStore = updateStore((store) => {
    const bid = store.bids.find((entry) => entry.id === bidId && entry.requirementId === requirementId);
    if (!bid) {
      return store;
    }

    const bids = store.bids.map((entry) =>
      entry.id === bidId ? { ...entry, status } : status === "AWARDED" && entry.requirementId === requirementId ? { ...entry, status: entry.id === bidId ? "AWARDED" : "REJECTED" } : entry
    );
    const requirements = store.requirements.map((entry) =>
      entry.id === requirementId
        ? { ...entry, status: status === "AWARDED" ? "AWARDED" : entry.status }
        : entry
    );
    const supplier = getUserOrThrow(bid.supplierId, store);
    const thread = createOrGetThread(store, requirements.find((entry) => entry.id === requirementId)!, supplier);
    thread.messages.push({
      id: newId("msg"),
      senderId: session.id,
      body:
        status === "SHORTLISTED"
          ? "Your bid has been shortlisted for buyer review."
          : status === "REJECTED"
            ? "This bid was marked as not selected."
            : "Congratulations. Your bid has been awarded.",
      createdAt: new Date().toISOString(),
      readBy: [session.id],
    });

    return { ...store, bids, requirements, threads: [...store.threads] };
  });

  return nextStore.bids.find((entry) => entry.id === bidId) ?? null;
}

export function getInboxThreads(userId?: string) {
  const session = userId ? { id: userId } : getSessionUser();
  if (!session) {
    return [];
  }

  const store = ensureStore();
  const threads = store.threads
    .filter((thread) => thread.participantIds.includes(session.id))
    .map((thread) => {
      const counterpartId = thread.participantIds.find((id) => id !== session.id) ?? session.id;
      const counterpart = getUserOrThrow(counterpartId, store);
      const messages = thread.messages.map((message) => {
        const sender = getUserOrThrow(message.senderId, store);
        return {
          id: message.id,
          senderId: message.senderId,
          senderName: sender.fullName || sender.email.split("@")[0],
          body: message.body,
          createdAt: message.createdAt,
          mine: message.senderId === session.id,
        };
      });

      const lastMessage = messages[messages.length - 1];
      return {
        id: thread.id,
        requirementId: thread.requirementId,
        subject: thread.subject,
        counterpartName: counterpart.fullName || counterpart.email.split("@")[0],
        counterpartCompany: counterpart.companyName || parseLocation(counterpart),
        counterpartVerified: counterpart.isVerified,
        unreadCount: thread.messages.filter(
          (message) => message.senderId !== session.id && !message.readBy.includes(session.id)
        ).length,
        lastMessage: lastMessage?.body ?? "No messages yet",
        lastMessageAt: lastMessage?.createdAt ?? new Date().toISOString(),
        shielded: thread.shielded,
        messages,
      } satisfies InboxThread;
    })
    .sort((left, right) => new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime());

  return threads;
}

export function markInboxThreadRead(threadId: string) {
  const session = getSessionUser();
  if (!session) {
    return;
  }
  updateStore((store) => ({
    ...store,
    threads: store.threads.map((thread) =>
      thread.id === threadId ? markThreadRead(thread, session.id) : thread
    ),
  }));
}

export function sendInboxMessage(threadId: string, body: string) {
  const session = getSessionUser();
  if (!session) {
    throw new Error("Sign in required");
  }

  updateStore((store) => ({
    ...store,
    threads: store.threads.map((thread) =>
      thread.id === threadId
        ? {
            ...thread,
            messages: [
              ...thread.messages,
              {
                id: newId("msg"),
                senderId: session.id,
                body,
                createdAt: new Date().toISOString(),
                readBy: [session.id],
              },
            ],
          }
        : thread
    ),
  }));
}
