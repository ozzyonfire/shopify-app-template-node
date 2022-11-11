/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  assetPrefix: process.env.HOST,
  // basePath: '/frontend',
}

module.exports = nextConfig
