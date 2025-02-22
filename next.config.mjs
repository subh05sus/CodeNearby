/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      "avatars.githubusercontent.com",
      "res.cloudinary.com",
      "api.microlink.io",
      "static-maps.openstreetmap.org",
      "images.unsplash.com",
      "assets.aceternity.com",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.microlink.io" },
      { protocol: "https", hostname: "static-maps.openstreetmap.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "assets.aceternity.com" },
    ],
  },
};
export default nextConfig;
