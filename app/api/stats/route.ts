import { getAuthStore } from "@/lib/auth-store";

export async function GET() {
  const store = getAuthStore();

  return Response.json({
    totalUsers: store.users.length,
    suppliers: store.users.filter((user) => user.role === "supplier").length,
    buyers: store.users.filter((user) => user.role === "buyer").length,
    totalLogins: store.stats.totalLogins,
    supplierLogins: store.stats.supplierLogins,
    buyerLogins: store.stats.buyerLogins,
  });
}
