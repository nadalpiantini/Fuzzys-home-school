// apps/web/eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import next from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';
import unused from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Ignorar build y dependencias
  { ignores: ['.next/**', 'dist/**', 'node_modules/**', '.vercel/**', '**/chunks/**', '**/static/**', '**/16-41c88764631f85ae.js', '**/edge-runtime-webpack.js', '**/middleware.js', 'postcss.config.js'] },

  // Reglas base JS
  js.configs.recommended,

  // TypeScript con type-check (usa tu tsconfig del paquete)
  ...tseslint.configs.recommendedTypeChecked,

  // Reglas Next.js (Core Web Vitals)
  next.configs['core-web-vitals'],

  // Tu capa de proyecto
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // IMPORTANTE: apunta al tsconfig del paquete web
        project: ['./tsconfig.json'],
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
      'unused-imports': unused,
    },
    rules: {
      // Limpieza
      'unused-imports/no-unused-imports': 'error',
      'import/order': ['warn', { 'newlines-between': 'always' }],

      // Next/React comunes
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Menos ruidos
      'no-console': 'off',
    },
  },

  // Desactiva reglas que chocan con Prettier
  prettier,
);
