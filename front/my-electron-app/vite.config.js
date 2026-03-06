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
        target: "https://chust-express-backend.onrender.com", // Forward it to your Node.js backend
        changeOrigin: true, // Needed for virtual hosting
        secure: false, // Since it's local HTTP
      },
      "/uploads": {
        target: "https://chust-express-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
