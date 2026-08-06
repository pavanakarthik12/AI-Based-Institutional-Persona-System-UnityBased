import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Use HTTPS in dev when a mkcert certificate is present alongside this config.
// Run: mkcert 192.168.0.9 localhost 127.0.0.1
// This generates 192.168.0.9+2.pem and 192.168.0.9+2-key.pem in the frontend/ dir.
const certFile = path.join(__dirname, "192.168.0.9+2.pem");
const keyFile = path.join(__dirname, "192.168.0.9+2-key.pem");
const hasHttpsCert = fs.existsSync(certFile) && fs.existsSync(keyFile);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.9", "192.168.*"],
  ...(hasHttpsCert
    ? {
        experimental: {
          https: {
            cert: certFile,
            key: keyFile,
          },
        },
      }
    : {}),
};

export default nextConfig;
