module.exports = {
  root: true,
  ignorePatterns: ['dist/'],
  extends: [
    '@testoil/eslint-config-testoil',
  ],
  rules: {
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    camelcase: 'off',
    '@typescript-eslint/no-use-before-define': 'off',
  },
}
