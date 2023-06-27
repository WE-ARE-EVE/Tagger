import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dsv from '@rollup/plugin-dsv'


export default defineConfig({
  plugins: [vue(), dsv()],
  server: {
    port: 8090,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://20.51.219.72:4208',
        rewrite: (path) => path.replace(/^\/api/, ''),
        changeOrigin: true,
        logLevel: 'debug'
      }
    }
  }
})
