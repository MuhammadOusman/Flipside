import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComicButton from "@/components/ComicButton";

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl border-4 border-black bg-white p-10 text-center shadow-hard">
            <h1 className="font-heading text-5xl">CHECKOUT MOVED</h1>
            <p className="mt-3 font-bold text-gray-700">
              Checkout now runs in the global slide-up drawer with reservation timers, payment proof upload, and blacklist checks.
            </p>
            <div className="mt-6">
              <Link href="/shop">
                <ComicButton size="lg">Go Back To Shop</ComicButton>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
