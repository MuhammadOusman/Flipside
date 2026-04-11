import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kwocknpjxrggzehdkhvl.supabase.co";
let supabaseHost = "kwocknpjxrggzehdkhvl.supabase.co";

try {
  supabaseHost = new URL(supabaseUrl).hostname;
} catch {
  // Keep fallback host.
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: supabaseHost,
      },
    ],
  },
};

export default nextConfig;
