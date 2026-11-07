import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**"] },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "test/**/*.mjs", "*.mjs"],
    rules: {
      complexity: ["error", 10],
      "max-depth": ["error", 2],
      "max-lines": ["error", 500],
      "max-lines-per-function": ["error", { max: 20, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true, allowTypedFunctionExpressions: true }],
    },
  },
);
