import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { execSync } from 'child_process'

const BUILD_VERSION = Date.now().toString()
const COMMIT_COUNT = execSync('git rev-list --count HEAD').toString().trim()
const APP_VERSION = `v1.${COMMIT_COUNT}`

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_VERSION),
    __APP_LABEL__: JSON.stringify(APP_VERSION),
  },
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
      targets: ['chrome >= 60', 'not dead'],
      additionalLegacyPolyfills: ['core-js/stable'],
      renderModernChunks: false, // TODO: включить обратно после проверки на старых планшетах
    }),
    {
      name: 'emit-version-file',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({ version: BUILD_VERSION }),
        })
      },
    },
  ],
}))
