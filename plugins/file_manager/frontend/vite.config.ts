import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/api/plugins/file_manager/",
  plugins: [react()],
  server: {
    proxy: {
      "^/api(?!/plugins/file_manager/(?:[^/]+.(?:.+)))/.*": {
        target: "http://192.168.31.198:1329",
        secure: false,
        changeOrigin: true,
      },
    },
  },
});
