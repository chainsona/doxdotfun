/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/doxdotfun/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/doxdotfun/api/:path*"
            : "/api/",
      },
      // {
      //   source: "/api/py/:path*",
      //   destination:
      //     process.env.NODE_ENV === "development"
      //       ? "http://127.0.0.1:8000/api/py/:path*"
      //       : "/api/",
      // },
      // Dashboard route
      {
        source: "/doxdotfun",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/doxdotfun"
            : "/doxdotfun",
      },
      {
        source: "/doxdotfun/leaderboard",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/doxdotfun/leaderboard"
            : "/doxdotfun/leaderboard",
      },
      {
        source: "/doxdotfun/doxlist",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/doxdotfun/doxlist"
            : "/doxdotfun/doxlist",
      },
      {
        source: "/doxdotfun/help",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/doxdotfun/help"
            : "/doxdotfun/help",
      },
      {
        source: "/doxdotfun/privacy",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/doxdotfun/privacy"
            : "/doxdotfun/privacy",
      },
      {
        source: "/doxdotfun/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/doxdotfun/api/docs"
            : "/doxdotfun/api/docs",
      },
      {
        source: "/doxdotfun/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/doxdotfun/api/openapi.json"
            : "/doxdotfun/api/openapi.json",
      },
    ];
  },
};

module.exports = nextConfig;
