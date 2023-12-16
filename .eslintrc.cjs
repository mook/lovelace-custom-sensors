/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  ignorePatterns: ["dist/"],
  env: { node: true, es2023: true },
  extends: ["eslint:recommended"],
  root: true,
  overrides: [
    {
      files: ["**/*.ts"],
      env: { browser: true, node: false },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
      plugins: ["@typescript-eslint"],
    },
    {
      files: ["*.mjs"],
      parserOptions: {
        sourceType: "module",
      },
    },
  ],
};
