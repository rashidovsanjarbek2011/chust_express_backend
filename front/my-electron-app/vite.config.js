import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue() /* vueDevTools() */],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Rule: When the frontend requests anything starting with /api
      "/api": {
        target: "http://localhost:5000", // Forward it to your Node.js backend
        changeOrigin: true, // Needed for virtual hosting
        secure: false, // Since it's local HTTP
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
