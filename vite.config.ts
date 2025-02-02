import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    jsxImportSource: 'react',
    babel: {
      plugins: [
        ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
      ]
    }
  })],
  base: "/",
  optimizeDeps: {
    include: ["fabric", "react", "react-dom", "lucide-react"],
    force: true
  },
  build: {
    commonjsOptions: {
      include: [/fabric/, /node_modules/],
    },
    sourcemap: true,
    minify: 'terser',
    outDir: 'dist',
  },
});
