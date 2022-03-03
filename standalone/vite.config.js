import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      "REACT_APP_ENV":true,
      "REACT_APP_X_scale": 1.5,
      "REACT_APP_X_translate": 0.5,
      "REACT_APP_Y_translate": 0.0,
      "REACT_APP_Z_translate": 0.0,
      "REACT_APP_X_rotation": 0.0,
      "REACT_APP_Y_rotation": 0.0,
      "REACT_APP_Z_rotation": 0.0,
    },
    global: {}
  }
})
