module.exports = {
  root: true,
  extends: ["@riscovery/eslint-config/nextjs"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
