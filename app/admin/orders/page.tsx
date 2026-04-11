import AdminOrdersClient, { type AdminOrder } from "@/components/AdminOrdersClient";
import { getAdminOrders } from "@/lib/queries";
import { getTenantIdFromRequest } from "@/lib/tenant";

export default async function AdminOrdersPage() {
  const tenantId = await getTenantIdFromRequest();
  const orders = await getAdminOrders(tenantId, true);

  return <AdminOrdersClient initialOrders={orders as unknown as AdminOrder[]} />;
}
