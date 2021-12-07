const { getESLintConfig } = require('@iceworks/spec');

module.exports = getESLintConfig('react-ts', {
  env: {
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-unused-expressions': 'off',
    'no-async-promise-executor': 'off',
    'no-mixed-operators': 'off',
    'react/static-property-placement': 'off',
    '@iceworks/best-practices/recommend-functional-component': 'off',
    '@iceworks/best-practices/recommend-polyfill': 'off',
    'no-nested-ternary': 'warn',
  },
});

