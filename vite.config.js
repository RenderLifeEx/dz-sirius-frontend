import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            '@stylexjs/babel-plugin',
            {
              dev: mode !== 'production',
              runtimeInjection: true,
              genConditionalClasses: true,
              treeshakeCompensation: true,
              unstable_moduleResolution: {
                type: 'commonJS',
                rootDir: process.cwd(),
              },
            },
          ],
        ],
      },
    }),
  ],
}))
