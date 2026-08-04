/**
 * Vite Configuration
 *
 * Bundler: Vite 8, running on Rolldown (Rust-based bundler, replaces
 * both esbuild and Rollup) with Oxc handling JS transforms/minification
 * and Lightning CSS handling CSS minification.
 *
 * PLUGIN PIPELINE (order verified against official @vitejs/plugin-react
 * docs — react() runs first, babel() second):
 *   1. react()      — Oxc-powered JSX transform + Fast Refresh (the
 *                      default fast path; no Babel involved for plain
 *                      React code).
 *   2. babel({...}) — @rolldown/plugin-babel running ONLY the React
 *                      Compiler preset, scoped via reactCompilerPreset()'s
 *                      built-in file filter (component/hook-shaped files
 *                      only — not every .jsx file pays the Babel tax).
 *                      React Compiler auto-memoizes components/hooks at
 *                      build time, replacing most manual useMemo/
 *                      useCallback/React.memo usage.
 *   3. tailwindcss() — Tailwind v4's native Vite plugin. No
 *                      tailwind.config.js or postcss.config.js needed —
 *                      theme tokens live in src/index.css via @theme.
 *
 * BUILD OPTIONS:
 *   minify: 'oxc' — explicit (matches the new default; stated outright
 *                   rather than relying on the implicit default, so this
 *                   config stays correct even if Vite's default changes
 *                   in a future release).
 *   cssMinify: true — resolves to Lightning CSS (the new default CSS
 *                   minifier, replacing esbuild's CSS handling).
 *   rolldownOptions.output.advancedChunks — Rolldown's supported
 *                   replacement for the deprecated rollupOptions.output.
 *                   manualChunks. Same intent (isolate React and Redux
 *                   into their own cacheable vendor chunks so app-code
 *                   changes don't invalidate the framework chunk's
 *                   browser cache), expressed via test-regex groups.
 *
 * Dev server proxy is intentionally NOT used — the backend's CORS
 * allowlist already trusts the frontend origin directly, and httpClient
 * (built below in this same batch) always calls the full
 * VITE_API_BASE_URL with credentials: 'include'. This keeps dev and
 * prod networking behavior identical.
 */

import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset({ target: '19' })],
      parserOpts: { plugins: ['jsx'] }, // ← add this
    }),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'esnext',
    minify: 'oxc',
    cssMinify: true,
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'vendor-react', test: /\/node_modules\/react(?:-dom)?\// },
            {
              name: 'vendor-redux',
              test: /\/node_modules\/(@reduxjs\/toolkit|react-redux)\//,
            },
            { name: 'vendor-utils', test: /\/node_modules\// },
          ],
        },
      },
    },
  },
});