// ESLint flat config (ESLint 9).
//
// Three areas, three environments — a single browser-globals config would flag
// `process` in the build scripts and `console` in the serverless functions:
//
//   src/         browser + React (hooks rules, Fast Refresh safety)
//   api/         Node serverless functions on Vercel
//   scripts/     Node build tooling (prerender, one-off repairs)
//
// Type-aware linting is deliberately NOT enabled: `npm run build` already runs
// `tsc` over the whole project, so the type errors are caught there, and the
// type-checked rule set would double the CI time for no new signal.

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Build output and vendored code are not ours to lint.
  { ignores: ['dist/**', 'node_modules/**', '.trailer-build/**'] },

  // ── The app ───────────────────────────────────────────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // A module that exports something other than a component breaks Fast
      // Refresh in dev only — worth knowing, not worth failing a build over.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // `catch {}` is the house pattern for localStorage and analytics: those
      // paths must never throw into the UI, and there is genuinely nothing to
      // do with the error. An empty block anywhere else is still an error.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Visible, not blocking. The remaining `any`s are recharts render-prop
      // callbacks whose upstream types are too loose to narrow honestly;
      // `npm run build` type-checks the project either way.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // ── Third-party analytics snippets ────────────────────────────────────────
  //
  // loadGTM and loadMetaPixel are Google's and Meta's own bootstrap code,
  // pasted verbatim so it stays diff-able against the vendor docs. It is
  // minified ES5 and legitimately uses `var`, `arguments` and `.apply`, and it
  // pokes globals TypeScript cannot know about. Rewriting it to satisfy a
  // linter would mean maintaining a fork of someone else's snippet.
  {
    files: ['src/lib/analytics.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'prefer-rest-params': 'off',
      'prefer-spread': 'off',
      'no-var': 'off',
    },
  },

  // ── Vercel serverless functions ───────────────────────────────────────────
  {
    files: ['api/**/*.js', 'middleware.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
  },

  // ── Build and maintenance scripts ─────────────────────────────────────────
  {
    files: ['scripts/**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
  },
);
