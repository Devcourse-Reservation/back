import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      ecmaVersion: 2021, // 최신 ECMAScript 버전 사용
      sourceType: "module",
      globals: {
        ...globals.browser, // ✅ 브라우저 환경
        ...globals.node, // ✅ Node.js 환경 추가
      },
    },
  },
  pluginJs.configs.recommended,
];
