/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration works for both web (Render) and Electron
  images: {
    unoptimized: true,
    // Only use custom loader for Electron builds
    ...(process.env.ELECTRON && {
      loader: 'custom',
      loaderFile: './utils/imageLoader.js'
    })
  },
  trailingSlash: true,
  // Only use 'out' directory for Electron builds, not for web deployment
  // Render will use default .next directory (undefined = default)
  distDir: process.env.ELECTRON ? 'out' : undefined,
  // Disable static optimization for dynamic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig

