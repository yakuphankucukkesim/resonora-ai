/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    serverComponentsExternalPackages: ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],
  },
  // Vercel için optimize edilmiş ayarlar
  images: {
    domains: [],
  },
  // Dosya yükleme için gerekli ayarlar
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
};

export default config;
