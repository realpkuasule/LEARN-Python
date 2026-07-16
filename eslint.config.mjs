import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-restricted-imports": ["warn", { patterns: ["node-fetch"] }],
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      "no-magic-numbers": [
        "warn",
        {
          ignore: [-1, 0, 1, 2, 3, 4, 5, 10, 16, 17, 20, 50, 100, 200, 300],
          ignoreArrayIndexes: true,
        },
      ],
      "max-lines": ["warn", { max: 300, skipBlankLines: true, skipComments: true }],
      "no-restricted-properties": [
        "error",
        { object: "process", property: "env", message: "Use src/lib/env.ts for environment access." },
      ],
      "no-debugger": "error",
    },
  },
  {
    files: ["src/lib/env.ts"],
    rules: {
      "no-restricted-properties": "off",
    },
  },
  {
    files: ["**/*.mjs"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
  {
    files: ["tests/**", "src/domain/chapter-catalog.ts"],
    rules: {
      "no-magic-numbers": "off",
    },
  },
  globalIgnores([".next/**", "node_modules/**", "coverage/**", "next-env.d.ts"]),
]);
