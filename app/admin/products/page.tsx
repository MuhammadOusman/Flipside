import Link from "next/link";
import { getAdminProducts } from "@/lib/queries";
import { getTenantIdFromRequest } from "@/lib/tenant";

export default async function ProductsPage() {
  const tenantId = await getTenantIdFromRequest();
  const products = await getAdminProducts(tenantId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl">PRODUCT INVENTORY</h1>
          <p className="font-bold text-gray-600">Manage your one-of-one catalog</p>
        </div>
        <Link href="/admin/products/new" className="border-4 border-black bg-[var(--comic-green)] px-5 py-3 font-heading text-xl text-white shadow-hard">
          + ADD PRODUCT
        </Link>
      </div>

      <div className="overflow-x-auto border-4 border-black bg-white shadow-hard">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gradient-to-r from-[var(--comic-red)] to-[var(--comic-purple)] text-white">
            <tr>
              <th className="border-r-2 border-black px-4 py-3 text-left font-heading text-lg">Item</th>
              <th className="border-r-2 border-black px-4 py-3 text-left font-heading text-lg">Sizes</th>
              <th className="border-r-2 border-black px-4 py-3 text-left font-heading text-lg">Condition</th>
              <th className="border-r-2 border-black px-4 py-3 text-left font-heading text-lg">Price</th>
              <th className="border-r-2 border-black px-4 py-3 text-left font-heading text-lg">Sourcing Cost</th>
              <th className="px-4 py-3 text-left font-heading text-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t-2 border-black hover:bg-gray-50">
                <td className="border-r-2 border-black px-4 py-3">
                  <p className="font-bold">{product.brand} {product.model}</p>
                  <p className="text-xs font-bold text-gray-500">/{product.slug}</p>
                </td>
                <td className="border-r-2 border-black px-4 py-3 font-bold">UK {product.size_uk} / EU {product.size_eur}</td>
                <td className="border-r-2 border-black px-4 py-3 font-bold">{product.condition_grade}</td>
                <td className="border-r-2 border-black px-4 py-3 font-bold">Rs. {Math.round(product.price).toLocaleString()}</td>
                <td className="border-r-2 border-black px-4 py-3 font-bold">Rs. {Math.round(product.sourcing_cost).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="border-2 border-black bg-black px-2 py-1 text-xs font-bold text-white">{product.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
