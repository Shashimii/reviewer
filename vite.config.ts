import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Lessons and questions change more often than the app code, so they get their own file
        // and the browser can keep the rest cached.
        codeSplitting: {
          groups: [
            { name: 'content', test: /[/\\]content[/\\].*\.json$/ },
            { name: 'vendor', test: /[/\\]node_modules[/\\]/ },
          ],
        },
      },
    },
    // The content file holds the whole question bank; its size is expected.
    chunkSizeWarningLimit: 2000,
  },
})
