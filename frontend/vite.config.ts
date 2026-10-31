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
        roles: path.resolve(__dirname, 'admin/roles.html'),
        categoriasEjercicios: path.resolve(__dirname, 'admin/categorias-ejercicios.html'),
        equipamientos: path.resolve(__dirname, 'admin/equipamiento.html'),
        gruposMusculares: path.resolve(__dirname, 'admin/grupos-musculares.html'),
        ejercicios: path.resolve(__dirname, 'admin/ejercicios.html'),
        musculosAsociados: path.resolve(__dirname, 'admin/musculos-asociados.html'),
        categoriasGastos: path.resolve(__dirname, 'admin/categorias-gastos.html'),
        comprobantes: path.resolve(__dirname, 'admin/comprobantes.html'),
        membresias: path.resolve(__dirname, 'admin/membresias.html'),
        recepcionistaIndex: path.resolve(__dirname, 'recepcionista/index-recepcionista.html'),
        historialMedico: path.resolve(__dirname, 'recepcionista/historial-medico.html'),
        registroPago: path.resolve(__dirname, 'recepcionista/registrar-pago.html'),
        historialPago: path.resolve(__dirname, 'recepcionista/historial-pagos.html'),
        coachIndex: path.resolve(__dirname, 'coach/index-coach.html'),
        coachRutinas: path.resolve(__dirname, 'coach/rutinas.html'),
      },
    },
  },
  // ...
})