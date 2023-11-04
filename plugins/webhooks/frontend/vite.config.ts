import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/api/plugins/webhooks/frontend",
  plugins: [react()],
  server: {
    proxy: {
      "^/api/(?!plugins/webhooks/frontend/).*": {
        target: "http://localhost:5000",
        // target: "http://192.168.31.198:1329",
        secure: false,
        changeOrigin: true,
      },
    },
  },
});
