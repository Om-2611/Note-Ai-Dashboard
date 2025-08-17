import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Resolve pdf-lib for the server-side build
    if (isServer) {
      config.externals.push({
        'pdf-lib': 'commonjs pdf-lib',
      });
    }
    return config;
  },

};

export default nextConfig;

