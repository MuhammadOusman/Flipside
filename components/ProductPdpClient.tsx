"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Copy, Heart, MessageCircle } from "lucide-react";
import ComicButton from "@/components/ComicButton";
import type { PublicProduct } from "@/lib/db/types";
import { reserveProductAction } from "@/app/actions/storefront";
import { useCartStore } from "@/store/cart";
import { useUiStore } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

type ProductPdpClientProps = {
  product: PublicProduct;
};

function durationToHMS(timestamp?: string | null) {
  if (!timestamp) {
    return "00:00:00";
  }

  const diff = new Date(timestamp).getTime() - Date.now();
  if (diff <= 0) {
    return "00:00:00";
  }

  const sec = Math.floor(diff / 1000);
  const hh = String(Math.floor(sec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function ProductPdpClient({ product }: ProductPdpClientProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useUiStore((state) => state.openCartDrawer);
  const { isInWishlist, addItem: addWishlist, removeItem } = useWishlist();

  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const inWishlist = isInWishlist(product.id);

  const slides = useMemo(() => {
    const imageSlides: Array<{ type: "image" | "video"; src: string }> = (product.images || []).map((img) => ({
      type: "image",
      src: img,
    }));
    if (product.video_url) {
      imageSlides.splice(1, 0, { type: "video" as const, src: product.video_url });
    }
    return imageSlides;
  }, [product.images, product.video_url]);

  const isDroppingSoon =
    product.status === "dropping_soon" &&
    !!product.drop_time &&
    new Date(product.drop_time).getTime() > now;

  const dropCountdown = durationToHMS(product.drop_time);
  const reservedCountdown = durationToHMS(product.reserved_until);

  useEffect(() => {
    if (!product.drop_time) {
      return;
    }

    if (new Date(product.drop_time).getTime() <= now) {
      router.refresh();
    }
  }, [now, product.drop_time, router]);

  async function addToCart() {
    setError(null);
    startTransition(async () => {
      const result = await reserveProductAction(product.id);
      if (!result.ok) {
        setError(result.message);
        return;
      }

      addItem({
        id: product.id,
        title: `${product.brand} ${product.model}`,
        brand: product.brand,
        size: String(product.size_uk),
        price: product.price,
        image: product.images?.[0] || "/logo.png",
        slug: product.slug,
        reservedUntil: result.reservedUntil,
      });

      openCartDrawer();
    });
  }

  function toggleWishlist() {
    if (inWishlist) {
      removeItem(product.id);
      return;
    }

    addWishlist({
      id: product.id,
      name: `${product.brand} ${product.model}`,
      brand: product.brand,
      price: product.price,
      image: product.images?.[0] || "/logo.png",
      slug: product.slug,
      size: String(product.size_uk),
      condition: Number(product.condition_grade.split("/")[0] || 8),
    });
  }

  async function copyInstagramText() {
    const text = `🔥 ${product.brand} ${product.model}\nSize UK ${product.size_uk} / EU ${product.size_eur}\nCondition ${product.condition_grade}\nPrice Rs. ${product.price.toLocaleString()} 🔥`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const waText = encodeURIComponent(
    `Hi! I want to buy ${product.brand} ${product.model} - Size ${product.size_uk} for Rs. ${product.price}.`
  );
  const waHref = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567"}?text=${waText}`;

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2">
        <section>
          <Link href="/shop" className="mb-4 inline-block font-bold underline">
            Back to shop
          </Link>

          <div className="relative aspect-square overflow-hidden border-4 border-black shadow-hard-lg">
            {slides.length > 0 && slides[active]?.type === "image" && (
              <Image src={slides[active].src} alt={`${product.brand} ${product.model}`} fill className="object-cover" />
            )}
            {slides.length > 0 && slides[active]?.type === "video" && (
              <video className="h-full w-full object-cover" src={slides[active].src} autoPlay muted loop playsInline />
            )}

            {slides.length > 1 && (
              <>
                <button
                  onClick={() => setActive((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 border-2 border-black bg-white p-2"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActive((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 border-2 border-black bg-white p-2"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            {slides.map((slide, index) => (
              <button
                key={`${slide.src}-${index}`}
                onClick={() => setActive(index)}
                className={`relative h-16 overflow-hidden border-2 border-black ${active === index ? "ring-2 ring-[var(--comic-red)]" : ""}`}
              >
                {slide.type === "image" ? (
                  <Image src={slide.src} alt={`thumb-${index}`} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-black text-xs font-bold text-white">VIDEO</div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h1 className="font-heading text-5xl">{product.brand} {product.model}</h1>
          <p className="text-xl font-bold text-gray-700">Size UK {product.size_uk} | EU {product.size_eur}</p>

          {isDroppingSoon ? (
            <div className="border-4 border-black bg-yellow-200 p-6 text-center shadow-hard">
              <p className="font-heading text-2xl">DROP IN</p>
              <p className="font-heading text-5xl">{dropCountdown}</p>
              <p className="mt-2 text-sm font-bold">Price unlocks automatically at 00:00:00.</p>
              <ComicButton onClick={() => router.refresh()} className="mt-4">
                Refresh Drop
              </ComicButton>
            </div>
          ) : (
            <p className="font-heading text-5xl">Rs. {product.price.toLocaleString()}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {!isDroppingSoon && product.status === "available" && (
              <ComicButton onClick={addToCart} disabled={isPending} className="w-full">
                {isPending ? "Reserving..." : "Add to Cart"}
              </ComicButton>
            )}
            {product.status === "reserved" && (
              <div className="col-span-2 border-2 border-black bg-gray-200 p-3 text-sm font-bold">
                Currently in another user&apos;s cart. Check back in {reservedCountdown}.
              </div>
            )}

            <ComicButton variant="secondary" onClick={toggleWishlist} className="w-full">
              <span className="flex items-center justify-center gap-2">
                <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
                {inWishlist ? "Wishlisted" : "Add Wishlist"}
              </span>
            </ComicButton>

            <a href={waHref} target="_blank" rel="noreferrer" className="w-full">
              <ComicButton variant="danger" className="w-full">
                <span className="flex items-center justify-center gap-2">
                  <MessageCircle size={18} /> WhatsApp
                </span>
              </ComicButton>
            </a>
          </div>

          {error && <div className="border-2 border-black bg-red-100 p-3 font-bold text-red-700">{error}</div>}

          <div className="border-4 border-black bg-white p-4 shadow-hard">
            <p className="font-heading text-2xl">TRUST CHECK</p>
            <ul className="mt-2 space-y-2 text-sm font-bold">
              <li>Condition: {product.condition_grade}</li>
              <li>Flaws: {product.flaws?.length ? product.flaws.join(", ") : "None reported"}</li>
              <li>360 video is included in gallery slot 2.</li>
            </ul>
          </div>

          <ComicButton variant="secondary" onClick={copyInstagramText} className="w-full">
            <span className="flex items-center justify-center gap-2">
              {copied ? <Check size={16} /> : <Copy size={16} />} 1-Click IG Export
            </span>
          </ComicButton>
        </section>
      </div>
    </main>
  );
}
