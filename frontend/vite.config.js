import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// frontend runs on port 3000
// any request starting with /api is sent to the backend on port 5000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
