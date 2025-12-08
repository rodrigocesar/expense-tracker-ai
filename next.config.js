/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable strict mode for datepicker CSS
  transpilePackages: ['react-datepicker'],
  
  // Enable static export for S3 deployment
  output: process.env.NEXT_EXPORT ? 'export' : undefined,
  
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Trailing slash for static export compatibility
  trailingSlash: false,
  
  // Image optimization (disable for static export if needed)
  images: {
    unoptimized: process.env.NEXT_EXPORT === 'true',
  },
}

module.exports = nextConfig
