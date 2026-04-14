import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

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
    legacy({
      targets: ['chrome >= 71', 'not dead'],
      renderModernChunks: false, // TODO: включить обратно после проверки на старых планшетах
    }),
  ],
}))
