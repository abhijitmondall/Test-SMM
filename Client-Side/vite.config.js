import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      "60d2-103-112-149-116.ngrok-free.app", // Add the ngrok domain here
      "localhost", // If you want to allow localhost too
    ],
  },
});
