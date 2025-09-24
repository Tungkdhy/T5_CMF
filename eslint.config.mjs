import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Kế thừa cấu hình mặc định của Next.js
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Override rules
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",   // cho phép dùng any
      "react-hooks/exhaustive-deps": "off",         // tắt warning deps useEffect
      "@next/next/no-img-element": "off",           // cho phép <img>
    },
  },
];

export default eslintConfig;
