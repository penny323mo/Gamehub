import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "public/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: { globals: { document: "readonly", window: "readonly", navigator: "readonly", localStorage: "readonly", performance: "readonly", requestAnimationFrame: "readonly", cancelAnimationFrame: "readonly", AudioContext: "readonly", PointerEvent: "readonly", HTMLElement: "readonly", HTMLCanvasElement: "readonly", HTMLButtonElement: "readonly", HTMLInputElement: "readonly", Event: "readonly", console: "readonly", setTimeout: "readonly", clearTimeout: "readonly", crypto: "readonly", screen: "readonly" } }
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: { console: "readonly", process: "readonly", Buffer: "readonly" } }
  },
  {
    files: ["vite.config.ts"],
    languageOptions: { globals: { process: "readonly" } }
  }
);
