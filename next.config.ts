import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kwocknpjxrggzehdkhvl.supabase.co";
let supabaseHost = "kwocknpjxrggzehdkhvl.supabase.co";

try {
  supabaseHost = new URL(supabaseUrl).hostname;
} catch {
  // Keep fallback host.
}

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Next infers the correct repository root even when there are multiple lockfiles on the machine.
    root: __dirname,
  },
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
