import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ComicButton from "@/components/ComicButton";
import { getPublicProducts } from "@/lib/queries";
import { getTenantIdFromRequest } from "@/lib/tenant";

function parseConditionGrade(input: string) {
  const numeric = Number(input.split("/")[0]);
  return Number.isFinite(numeric) ? numeric : 8;
}

export default async function Home() {
  const tenantId = await getTenantIdFromRequest();
  const featured = await getPublicProducts(tenantId, 6);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="relative overflow-hidden border-b-4 border-black bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 py-24 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_#00000030_2px,_transparent_2px)] bg-[size:25px_25px]" />
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="font-heading text-7xl md:text-9xl drop-shadow-[5px_5px_0px_rgba(0,0,0,1)]">THRIFT SHOES</h1>
            <p className="mt-4 text-2xl font-bold md:text-4xl">Jordans • Dunks • Yeezy</p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/shop">
                <ComicButton size="lg">SHOP NOW</ComicButton>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between gap-3">
            <h2 className="font-heading text-5xl">LATEST DROP</h2>
            <Link href="/shop">
              <ComicButton variant="secondary">VIEW ALL</ComicButton>
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="border-4 border-black bg-white p-10 text-center shadow-hard">
              <p className="font-heading text-3xl">No products yet</p>
              <p className="mt-2 font-bold text-gray-600">Add inventory from admin panel to start selling.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((product) => (
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

        <section className="border-y-4 border-black bg-black py-14 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-6xl">NEW DROPS EVERY SUNDAY</h2>
            <p className="mt-3 font-bold">1-of-1 inventory with anti-snipe reservations</p>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
