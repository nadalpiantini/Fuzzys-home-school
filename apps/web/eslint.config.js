import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      '@next/next/no-img-element': 'off',
      // No NEXT_PUBLIC_* en código server
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env.NEXT_PUBLIC_SUPABASE_URL',
          message: 'No uses NEXT_PUBLIC_* en server',
        },
        {
          object: 'process',
          property: 'env.NEXT_PUBLIC_SUPABASE_ANON_KEY',
          message: 'No uses NEXT_PUBLIC_* en server',
        },
      ],
      // No createClient/createServerClient en top-level (versión simple vía pattern)
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Program > VariableDeclaration > VariableDeclarator[init.callee.name='createClient']",
          message: 'No instancies Supabase en top-level. Usa factory.',
        },
        {
          selector:
            "Program > VariableDeclaration > VariableDeclarator[init.callee.name='createServerClient']",
          message: 'No instancies Supabase SSR en top-level. Usa factory.',
        },
      ],
    },
  },
  {
    files: ['src/app/api/**/route.{ts,tsx}'],
    rules: {
      // exigir runtime node en API (para service role seguro)
      '@next/next/no-server-import-in-page': 'off',
    },
  },
];

export default eslintConfig;
