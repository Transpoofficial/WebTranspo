import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // domains: ['atofjdakcdpmetccupvn.supabase.co'],
    domains: [`${process.env.SUPABASE_HOST}.supabase.co`],
  },
};

export default nextConfig;
