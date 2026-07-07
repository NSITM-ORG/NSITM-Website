'use strict';

/**
 * ESLint Configuration
 *
 * Standard React + Vite ruleset, plus react-hooks and react-refresh
 * plugins for HMR-safety. Prettier's conflicting formatting rules are
 * disabled via eslint-config-prettier (Prettier handles formatting,
 * ESLint handles code quality — no overlap/conflict between the two).
 */

module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: '19.0' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};