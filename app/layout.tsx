import type { Metadata } from "next";
import { Bangers, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { AuthProvider } from "@/components/AuthProvider";

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flipside | Thrift Shoes Pakistan",
  description: "Premium thrift sneakers - Jordans, Dunks, Yeezy. 100% Legit. COD Available.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${bangers.variable} antialiased`}
      >
        <AuthProvider>
          <AnalyticsProvider>
            {children}
            <ScrollToTop />
            <WhatsAppButton />
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
