import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dsv from '@rollup/plugin-dsv'


export default defineConfig({
  plugins: [vue(), dsv()],
  server: {
    port: 8090,
    proxy: {
      '/api': {
        target: 'http://20.51.219.72:4208',
        rewrite: (path) => path.replace(/^\/api/, ''),
        changeOrigin: true,
        logLevel: 'debug',
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        }
      }
    }
  }
})
