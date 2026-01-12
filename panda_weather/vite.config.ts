import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    allowedHosts: true,

    proxy: {
      "/image": {
        target: "http://localhost:3077",
        changeOrigin: true
      },
      "/health": {
        target: "http://localhost:3077",
        changeOrigin: true
      }
    }
  }
});
