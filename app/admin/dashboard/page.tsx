import Link from "next/link";
import { DollarSign, Package, ShieldCheck, ShoppingBag } from "lucide-react";
import { getAdminOrders, getAdminProducts, getGrossProfit } from "@/lib/queries";
import { getTenantIdFromRequest } from "@/lib/tenant";

export default async function AdminDashboardPage() {
  const tenantId = await getTenantIdFromRequest();
  const [products, orders, grossProfit] = await Promise.all([
    getAdminProducts(tenantId),
    getAdminOrders(tenantId, true),
    getGrossProfit(tenantId),
  ]);

  const availableCount = products.filter((p) => p.status === "available").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl">MISSION CONTROL</h1>
        <p className="font-bold text-gray-600">Tenant: {tenantId}</p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="border-4 border-black bg-white p-5 shadow-hard">
          <p className="mb-2 flex items-center gap-2 font-bold text-gray-600">
            <Package size={18} /> Available pairs
          </p>
          <p className="font-heading text-4xl">{availableCount}</p>
        </article>

        <article className="border-4 border-black bg-white p-5 shadow-hard">
          <p className="mb-2 flex items-center gap-2 font-bold text-gray-600">
            <ShoppingBag size={18} /> Pending verification
          </p>
          <p className="font-heading text-4xl">{orders.length}</p>
        </article>

        <article className="border-4 border-black bg-white p-5 shadow-hard">
          <p className="mb-2 flex items-center gap-2 font-bold text-gray-600">
            <DollarSign size={18} /> Total Revenue
          </p>
          <p className="font-heading text-4xl">Rs. {Math.round(grossProfit.revenue).toLocaleString()}</p>
        </article>

        <article className="border-4 border-black bg-green-500 p-5 text-white shadow-hard-lg">
          <p className="mb-2 flex items-center gap-2 font-bold">
            <ShieldCheck size={18} /> Gross Profit
          </p>
          <p className="font-heading text-5xl">Rs. {Math.round(grossProfit.grossProfit).toLocaleString()}</p>
          <p className="mt-1 text-xs font-bold">Sum(Price) - Sum(sourcing_cost)</p>
        </article>
      </section>

      <section className="border-4 border-black bg-white p-6 shadow-hard">
        <h2 className="font-heading text-3xl">Verification Queue</h2>
        {orders.length === 0 ? (
          <p className="mt-3 font-bold text-gray-600">No pending orders right now.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id} className="flex items-center justify-between border-2 border-black bg-gray-50 p-3">
                <div>
                  <p className="font-bold">{order.customer_name}</p>
                  <p className="text-xs font-bold text-gray-600">{order.products?.brand} {order.products?.model}</p>
                </div>
                <Link href="/admin/orders" className="border-2 border-black bg-[var(--comic-purple)] px-3 py-1 text-xs font-bold text-white">
                  Review
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
