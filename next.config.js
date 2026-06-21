/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    let apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').trim();
    // Enlever les guillemets accidentels (ex: "https://..." ou 'https://...')
    apiUrl = apiUrl.replace(/^['"]|['"]$/g, '');
    
    // Si l'URL ne commence pas par http://, https:// ou /, on rajoute https://
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://') && !apiUrl.startsWith('/')) {
      apiUrl = 'https://' + apiUrl;
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
