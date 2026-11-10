import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

// Evals rodam contra o modelo real (custam tokens). Ficam fora do `pnpm test`:
// rode com `pnpm --filter web test:evals` ou pelo workflow "CI IA" (manual / label "evals").
try {
  process.loadEnvFile?.('.env')
} catch {
  // sem .env local: no CI as variáveis vêm dos secrets
}

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/evals/**/*.eval.test.ts'],
    testTimeout: 15 * 60 * 1000,
    alias: [
      { find: '@/backend', replacement: resolve(__dirname, './src/app/(backend)') },
      { find: '@/frontend', replacement: resolve(__dirname, './src/app/(frontend)') },
      { find: '@', replacement: resolve(__dirname, './src') },
    ],
    server: { deps: { inline: ['next'] } },
  },
})
