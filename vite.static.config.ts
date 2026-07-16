import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: `${projectRoot}static`,
  publicDir: `${projectRoot}public`,
  plugins: [react()],
  build: {
    outDir: `${projectRoot}release`,
    emptyOutDir: true,
  },
});
