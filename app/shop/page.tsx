import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getPublicProducts } from "@/lib/queries";
import { getTenantIdFromRequest } from "@/lib/tenant";

function parseConditionGrade(input: string) {
  const numeric = Number(input.split("/")[0]);
  return Number.isFinite(numeric) ? numeric : 8;
}

export default async function ShopPage() {
  const tenantId = await getTenantIdFromRequest();
  const products = await getPublicProducts(tenantId);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="border-b-4 border-black bg-gradient-to-r from-[var(--comic-red)] to-[var(--comic-purple)] py-12 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-heading text-6xl md:text-8xl">THE SHOP</h1>
            <p className="mt-2 text-xl font-bold">{products.length} PAIRS READY</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          {products.length === 0 ? (
            <div className="border-4 border-black bg-white p-10 text-center shadow-hard">
              <p className="font-heading text-4xl">No kicks found</p>
              <p className="mt-2 font-bold text-gray-600">Inventory will appear here as soon as products are added.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={`${product.brand} ${product.model}`}
                  brand={product.brand}
                  size={String(product.size_uk)}
                  price={product.price}
                  image={product.images?.[0] || "/logo.png"}
                  condition={parseConditionGrade(product.condition_grade)}
                  slug={product.slug}
                  status={product.status}
                  dropTime={product.drop_time}
                  reservedUntil={product.reserved_until}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
