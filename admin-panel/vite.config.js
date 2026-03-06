import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "https://chust-express-backend.onrender.com",
        changeOrigin: true,
      },
      "/uploads": {
        target: "https://chust-express-backend.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
