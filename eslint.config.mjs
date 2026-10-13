import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default defineConfig([
  ...nextVitals,
  prettier,
  { plugins: { prettier: prettierPlugin }, rules: { "prettier/prettier": ["error", { endOfLine: "auto" }] } },
  // These pages deliberately fetch external API data in an effect.
  { rules: { "react-hooks/set-state-in-effect": "off" } },
  globalIgnores([".next/**", ".next-http-test/**", "coverage/**", "node_modules/**", "next-env.d.ts"]),
]);
