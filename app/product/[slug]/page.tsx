import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductPdpClient from "@/components/ProductPdpClient";
import { getPublicProductBySlug } from "@/lib/queries";
import { getTenantIdFromRequest } from "@/lib/tenant";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenantId = await getTenantIdFromRequest();
  const product = await getPublicProductBySlug(tenantId, slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <ProductPdpClient product={product} />
      <Footer />
    </>
  );
}
