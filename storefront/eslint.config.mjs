import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Default: warn on `any` so developers are aware, but don't block builds.
    // Remove the `/* eslint-disable */` comments in individual files as you
    // incrementally add proper types to replace `any`.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Stricter rules for shared library and hook files — these are the most
    // reused code and should have proper types.
    files: ["src/lib/**/*.ts", "src/hooks/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
