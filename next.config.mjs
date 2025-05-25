/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: false
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Exclude problematic modules
    config.module.rules.push({
      test: /node_modules\/(undici|@firebase)/,
      use: 'null-loader'
    });

    return config;
  },
};

export default nextConfig;
