/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Native Node.js modules must not be bundled by Next.js
  serverExternalPackages: ['better-sqlite3'],
}

module.exports = nextConfig
