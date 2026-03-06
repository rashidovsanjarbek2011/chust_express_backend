import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5175,
    host: true,
    proxy: {
      "/api": {
        target: "https://chust-express-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
