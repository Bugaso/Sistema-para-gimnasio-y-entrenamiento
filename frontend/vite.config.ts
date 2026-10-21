import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  base: '/',
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
    // ...
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        registro: path.resolve(__dirname, 'registro.html'),
        inicioSesion: path.resolve(__dirname, 'inicio-sesion.html'),
        admin: path.resolve(__dirname, 'admin/index.html'),
        personal: path.resolve(__dirname, 'admin/personal.html'),
        roles: path.resolve(__dirname, 'admin/roles.html')
      },
    },
  },
  // ...
})