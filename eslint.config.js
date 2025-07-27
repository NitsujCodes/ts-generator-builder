import js from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

const srcRules = {
  files: ["./src/**/*.{js,ts}"],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: "./tsconfig.eslint.json",
    },
    globals: {
      ...globals.node,
    },
  },
  plugins: {
    "@typescript-eslint": tsEslint,
  },
  rules: {
    ...tsEslint.configs.recommended.rules,
    semi: ["error", "always"],
    quotes: ["error", "double"],
  },
};

const testRules = {
  ...srcRules,
  files: ["./tests/**/*.{js,ts}"],
  languageOptions: {
    ...srcRules.languageOptions,
    globals: {
      ...srcRules.languageOptions.globals,
      ...globals.jest,
    },
  },
};

/** @type {import("eslint").Linter.FlatConfig} */
export default [js.configs.recommended, srcRules, testRules];
