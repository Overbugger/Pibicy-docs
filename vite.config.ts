import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "",
  optimizeDeps: {
    include: ["fabric", "react", "react-dom", "lucide-react"],
  },
  build: {
    commonjsOptions: {
      include: [/fabric/, /node_modules/],
    },
    sourcemap: true,
    outDir: 'dist',
  },
});
