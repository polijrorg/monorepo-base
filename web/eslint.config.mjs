import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
 
const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    "node_modules/**", 
    ".next/**", "out/**", 
    "build/**", "next-env.d.ts", 
    "tests/**", "src/generated/**"]
  ),
])

export default eslintConfig;
