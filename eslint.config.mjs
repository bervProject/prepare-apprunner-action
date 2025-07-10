import { defineConfig, globalIgnores } from "eslint/config";
import jest from "eslint-plugin-jest";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import github from 'eslint-plugin-github';

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';


export default defineConfig([
    globalIgnores(["**/dist/", "**/lib/", "**/node_modules/", "**/jest.config.js"]),
    github.getFlatConfigs().browser,
    github.getFlatConfigs().recommended,
    github.getFlatConfigs().react,
    ...github.getFlatConfigs().typescript,
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        plugins: {
            jest
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...jest.environments.globals.globals,
            },

            parser: tsParser,
            ecmaVersion: 9,
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        rules: {
            "i18n-text/no-en": "warn",
            "@typescript-eslint/no-unused-vars": "error",

            "@typescript-eslint/explicit-member-accessibility": ["error", {
                accessibility: "no-public",
            }],

            "@typescript-eslint/no-require-imports": "error",
            "@typescript-eslint/array-type": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "@typescript-eslint/consistent-type-assertions": "error",

            "@typescript-eslint/explicit-function-return-type": ["error", {
                allowExpressions: true,
            }],

            "@typescript-eslint/no-array-constructor": "error",
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-extraneous-class": "error",
            "@typescript-eslint/no-for-in-array": "error",
            "@typescript-eslint/no-inferrable-types": "error",
            "@typescript-eslint/no-misused-new": "error",
            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/no-unnecessary-qualifier": "error",
            "@typescript-eslint/no-unnecessary-type-assertion": "error",
            "@typescript-eslint/no-useless-constructor": "error",
            "@typescript-eslint/no-var-requires": "error",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/prefer-function-type": "warn",
            "@typescript-eslint/prefer-includes": "error",
            "@typescript-eslint/prefer-string-starts-ends-with": "error",
            "@typescript-eslint/promise-function-async": "error",
            "@typescript-eslint/require-array-sort-compare": "error",
            "@typescript-eslint/restrict-plus-operands": "error",
            "@typescript-eslint/unbound-method": "error",
        },
    },
    eslintPluginPrettierRecommended
]);