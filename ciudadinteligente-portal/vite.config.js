import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: env.VITE_PATH || '/',
    test: {
      environment: 'node',
      coverage: {
        provider: 'v8',
        reporter: ['lcov', 'text'],
        reportsDirectory: 'coverage',
        include: ['src/**/*.{js,jsx}'],
        exclude: [
          'src/main.jsx',
          'src/App.jsx',
          'src/api/**',
          'src/components/**',
          'src/views/**',
          'src/provider/**',
        ],
      },
    },
  }
})