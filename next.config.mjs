import { dirname } from 'path'
import { fileURLToPath } from 'url'

/** @type {import('next').NextConfig} */
const __dirname = dirname(fileURLToPath(import.meta.url))
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    // ensure Turbopack uses the project folder as the workspace root (absolute)
    root: __dirname,
  },
}

export default nextConfig
