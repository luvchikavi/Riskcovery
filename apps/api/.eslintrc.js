module.exports = {
  root: true,
  extends: ["@riscovery/eslint-config/node"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
