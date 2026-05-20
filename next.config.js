/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Desativa verificação estática rígida de rotas caso haja imports dinâmicos/páginas de cliente
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
