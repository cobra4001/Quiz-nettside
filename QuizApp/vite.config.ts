import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: Number(env.VITE_PORT) || 5173,

      // Proxy API calls to .NET backend during development
      proxy: {
        [env.VITE_API_BASE_PATH || "/api"]: {
          target: env.VITE_API_URL || "http://localhost:5174",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: Number(env.VITE_PREVIEW_PORT) || 4173,
    },
  };
});
