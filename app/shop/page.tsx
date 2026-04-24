import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import {
  getPublicProductFilterOptions,
  getPublicProducts,
  type PublicProductSortOption,
} from "@/lib/queries";
import { getTenantIdFromRequest } from "@/lib/tenant";

type ShopSearchParams = {
  q?: string | string[];
  brand?: string | string[];
  size?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  sort?: string | string[];
};

function parseConditionGrade(input: string) {
  const numeric = Number(input.split("/")[0]);
  return Number.isFinite(numeric) ? numeric : 8;
}

function getSingleValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }
  return value || "";
}

function parseNumberParam(value: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseSortOption(value: string): PublicProductSortOption {
  if (value === "price_asc" || value === "price_desc") {
    return value;
  }

  return "newest";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const tenantId = await getTenantIdFromRequest();

  const q = getSingleValue(params.q).trim();
  const brand = getSingleValue(params.brand).trim();
  const sizeRaw = getSingleValue(params.size);
  const minPriceRaw = getSingleValue(params.minPrice);
  const maxPriceRaw = getSingleValue(params.maxPrice);
  const sort = parseSortOption(getSingleValue(params.sort));

  const sizeUk = parseNumberParam(sizeRaw);
  const minPrice = parseNumberParam(minPriceRaw);
  const maxPrice = parseNumberParam(maxPriceRaw);

  const [products, filterOptions] = await Promise.all([
    getPublicProducts(tenantId, {
      q,
      brand: brand || undefined,
      sizeUk,
      minPrice,
      maxPrice,
      sort,
    }),
    getPublicProductFilterOptions(tenantId),
  ]);

  const hasActiveFilters =
    !!q ||
    !!brand ||
    sizeUk !== undefined ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    sort !== "newest";

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
          <form method="GET" className="mb-6 border-4 border-black bg-white p-4 shadow-hard">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <label className="block xl:col-span-2">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">Search</span>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Brand or model"
                  className="w-full border-2 border-black px-3 py-2 font-bold"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">Brand</span>
                <select name="brand" defaultValue={brand} className="w-full border-2 border-black px-3 py-2 font-bold">
                  <option value="">All brands</option>
                  {filterOptions.brands.map((itemBrand) => (
                    <option key={itemBrand} value={itemBrand}>
                      {itemBrand}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">Size (UK)</span>
                <select name="size" defaultValue={sizeRaw} className="w-full border-2 border-black px-3 py-2 font-bold">
                  <option value="">All sizes</option>
                  {filterOptions.sizes.map((size) => (
                    <option key={size} value={String(size)}>
                      UK {size}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">Min price</span>
                <input
                  type="number"
                  name="minPrice"
                  defaultValue={minPriceRaw}
                  min={0}
                  placeholder="0"
                  className="w-full border-2 border-black px-3 py-2 font-bold"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">Max price</span>
                <input
                  type="number"
                  name="maxPrice"
                  defaultValue={maxPriceRaw}
                  min={0}
                  placeholder="100000"
                  className="w-full border-2 border-black px-3 py-2 font-bold"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-black pt-4">
              <label className="flex items-center gap-2 text-sm font-bold">
                <span>Sort:</span>
                <select name="sort" defaultValue={sort} className="border-2 border-black px-2 py-1">
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price low to high</option>
                  <option value="price_desc">Price high to low</option>
                </select>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="border-2 border-black bg-[var(--comic-green)] px-4 py-2 text-sm font-bold text-white"
                >
                  Apply Filters
                </button>
                <Link
                  href="/shop"
                  className="border-2 border-black bg-black px-4 py-2 text-sm font-bold text-white"
                >
                  Reset
                </Link>
              </div>
            </div>
          </form>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-gray-700">
              Showing {products.length} pair{products.length === 1 ? "" : "s"}
            </p>
            {hasActiveFilters && (
              <p className="border-2 border-black bg-yellow-100 px-3 py-1 text-xs font-bold">
                Filters are active
              </p>
            )}
          </div>

          {products.length === 0 ? (
            <div className="border-4 border-black bg-white p-10 text-center shadow-hard">
              <p className="font-heading text-4xl">No kicks found</p>
              <p className="mt-2 font-bold text-gray-600">
                {hasActiveFilters
                  ? "Try adjusting filters or reset to view all products."
                  : "Inventory will appear here as soon as products are added."}
              </p>
              {hasActiveFilters && (
                <div className="mt-5">
                  <Link
                    href="/shop"
                    className="inline-block border-2 border-black bg-black px-4 py-2 text-sm font-bold text-white"
                  >
                    View all products
                  </Link>
                </div>
              )}
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
