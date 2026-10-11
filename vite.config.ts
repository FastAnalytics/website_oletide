import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig(() => ({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    nitro({ preset: "cloudflare-pages" }),
  ],
}));
