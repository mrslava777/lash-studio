import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { build } from "vite";

const root = path.resolve(import.meta.dirname, "..");

await build({
  configFile: false,
  root,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
});
console.log("✅ Build done!");
