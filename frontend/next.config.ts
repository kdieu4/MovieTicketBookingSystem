import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Poster nằm trên Supabase Storage: Next tự resize/cache về đúng kích thước hiển thị
    // thay vì tải nguyên ảnh gốc cho mọi thẻ phim.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;