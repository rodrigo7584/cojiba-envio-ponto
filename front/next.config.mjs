/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: "10mb", // Define o limite para 10MB
  },
};

export default nextConfig;
