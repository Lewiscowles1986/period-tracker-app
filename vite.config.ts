import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8095,
    hmr: {
      overlay: false,
    },
  },
  base: process.env.VITE_BASE_URL || "/",
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Fixes “Invalid hook call” issues that can happen when deps pull in
    // more than one copy of React in Vite's module graph.
    dedupe: ["react", "react-dom"],
  },
}));
