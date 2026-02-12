/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.soundon.fm",
      },
      {
        protocol: "https",
        hostname: "image.firstory-cdn.me",
      },
      {
        protocol: "https",
        hostname: "d3mww1g1pfq2pt.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "d3t3ozftmdmh3i.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "storage.buzzsprout.com",
      },
      {
        protocol: "https",
        hostname: "i1.sndcdn.com",
      },
    ],
  },
}

module.exports = nextConfig
