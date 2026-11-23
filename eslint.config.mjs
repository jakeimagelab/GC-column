import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The existing visual editors and motion primitives intentionally mirror
    // external state into React state and forward polymorphic refs.
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".next-*/**",
    ".playwright-cli/**",
    "build/**",
    "next-env.d.ts",
    "out/**",
    "output/**",
    "public/**",
    "skills/**",
  ]),
]);

export default eslintConfig;
