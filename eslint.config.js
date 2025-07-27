import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

const srcRules = {
    files: ["./src/**/*.{js,ts}"],
    languageOptions: {
        parser: tsparser,
        parserOptions: {
            project: "./tsconfig.eslint.json"
        },
        globals: {
            ...globals.node
        },
    },
    plugins: {
        "@typescript-eslint": tseslint
    },
    rules: {
        ...tseslint.configs.recommended.rules,
        semi: ["error", "always"],
        quotes: ["error", "double"]
    }
}

const testRules = {
    ...srcRules,
    files: ["./tests/**/*.{js,ts}"],
    languageOptions: {
        ...srcRules.languageOptions,
        globals: {
            ...srcRules.languageOptions.globals,
            ...globals.jest
        }
    }
}

/** @type {import("eslint").Linter.FlatConfig} */
export default [
    js.configs.recommended,
    srcRules,
    testRules
];