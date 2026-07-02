/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import Icons from 'unplugin-icons/vite'

// Under Vitest, the tanstackStart/nitro plugins start a full Nitro dev
// instance that never gets torn down within Vitest's close timeout
// (harmless, but adds a ~10s hang + a stray teardown error to every test
// run). They're not needed to run unit tests, so skip them when VITEST is set.
const isVitest = !!process.env.VITEST

export default defineConfig({
  plugins: [
    tailwindcss(),
    Icons({ compiler: 'jsx', jsx: 'react' }),
    !isVitest &&
      tanstackStart({
        prerender: {
          enabled: true,
          crawlLinks: true,
          failOnError: true,
        },
      }),
    viteReact(),
    !isVitest && nitro(),
  ],
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
  },
})
