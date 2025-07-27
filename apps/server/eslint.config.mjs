import { URL } from 'node:url';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import * as tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import js from '@eslint/js';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    js.configs.recommended,
    {
        rules: { ...prettier.rules }
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigRootDir: new URL('.', import.meta.url).pathname
            },
            globals: {
                ...globals.node,
                ...globals.es2020
            }
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            prettier: eslintPluginPrettier,
        },
        rules: {
            ...tseslint.configs.recommendedTypeChecked[0].rules,
            'prettier/prettier': 'error'
        }
    }
];