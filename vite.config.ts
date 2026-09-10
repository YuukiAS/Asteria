import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf("node_modules") === -1) return
          if (id.indexOf("lucide-react") !== -1 || id.indexOf("lucide") !== -1) return "icons"
          if (id.indexOf("katex") !== -1) return "math"
          if (id.indexOf("@tiptap") !== -1 || id.indexOf("prosemirror") !== -1) return "rich-text"
          if (id.indexOf("@xyflow") !== -1) return "flow"
          if (id.indexOf("react") !== -1 || id.indexOf("zustand") !== -1 || id.indexOf("dexie") !== -1) return "vendor"
        },
      },
    },
  },
  server: {
    watch: {
      ignored: ["**/.codex/**", "**/.runtime/**"],
    },
  },
})
