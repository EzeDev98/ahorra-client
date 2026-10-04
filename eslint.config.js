import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist', 'node_modules', 'public'] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, __APP_BUILD_ID__: 'readonly', __APP_VERSION__: 'readonly' },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@patternfly/*', '@patternfly/**'],
              message: 'Import PatternFly only inside src/shared/components/ui/. Use the Ahorra wrapper components.',
            },
          ],
        },
      ],
    },
  },
  // Build tooling runs in Node, not the browser.
  { files: ['vite.config.js', 'vite-plugins/**'], languageOptions: { globals: globals.node } },
  // The one folder allowed to import PatternFly.
  { files: ['src/shared/components/ui/**'], rules: { 'no-restricted-imports': 'off' } },
];
