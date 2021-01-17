module.exports = {
  extends: ['airbnb-typescript/base'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    "import/extensions" : 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "max-len": 1
  }
};