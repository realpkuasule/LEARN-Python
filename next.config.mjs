/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
