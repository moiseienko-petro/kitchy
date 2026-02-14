import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "../frontend_dist"),
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.0.132:8000",
        changeOrigin: true
      }
    }
  }
})