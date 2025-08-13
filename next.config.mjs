/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // CORS回避用プロキシ設定（開発時のみ使用、デプロイ時は無効化）
  async rewrites() {
    return [
      {
        source: '/api/ai-diagnosis',
        destination: `https://app-kenq-7-h7gre0afdgdbbzhy.canadacentral-01.azurewebsites.net/ai-diagnosis`,
      },
      {
        source: '/api/project-registration',
        destination: `https://app-kenq-7-h7gre0afdgdbbzhy.canadacentral-01.azurewebsites.net/project-registration`,
      },
      {
        source: '/api/auth/login',
        destination: `https://app-kenq-7-h7gre0afdgdbbzhy.canadacentral-01.azurewebsites.net/auth/login`,
      },
      {
        source: '/api/favorites',
        destination: `https://app-kenq-7-h7gre0afdgdbbzhy.canadacentral-01.azurewebsites.net/favorites`,
      },
    ];
  },
}

export default nextConfig;
