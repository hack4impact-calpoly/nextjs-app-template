/** @type {import('next').NextConfig} */
const nextConfig = {
  // HTTP tests must not overwrite the developer's normal build output.
  distDir: process.env.COFFEE_SHOP_HTTP_TEST === "1" ? ".next-http-test" : ".next",
};

module.exports = nextConfig;
