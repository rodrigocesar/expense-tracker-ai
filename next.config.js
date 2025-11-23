/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable strict mode for datepicker CSS
  transpilePackages: ['react-datepicker'],
}

module.exports = nextConfig
