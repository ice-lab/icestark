const { eslintTS, deepmerge } = require('@ice/spec');

module.exports = deepmerge(eslintTS, {
  env: {
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/interface-name-prefix': 1,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
});
