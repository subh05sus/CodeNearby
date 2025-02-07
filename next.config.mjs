/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "avatars.githubusercontent.com",
      "res.cloudinary.com",
      "api.microlink.io",
      "static-maps.openstreetmap.org",
    ],
  },
};
export default nextConfig;
