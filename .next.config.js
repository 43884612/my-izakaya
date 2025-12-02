/** @type {import('next').NextConfig} */
const nextConfig = {
  // 強制關閉 Turbopack，用回穩定的 Webpack
  experimental: {
    turbotrace: false,
  },
  // 下面這行才是重點！！！
  webpackDevMiddleware: config => config,
};

module.exports = nextConfig;