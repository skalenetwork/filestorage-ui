/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    if (dev) {
      console.log(config.watchOptions);
      config.watchOptions.ignored.push("./src/styles/globals.css");
    }
    // Important: return the modified config
    return config
  },
  reactStrictMode: true,
}

module.exports = nextConfig
