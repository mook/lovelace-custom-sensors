/// <reference types="node" />
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/card.ts"),
      formats: ["es"],
      fileName: "sensors",
    },
  },
});
