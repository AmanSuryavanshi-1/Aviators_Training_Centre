
// ESLint configuration for production build
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-require-imports': 'warn',
    'react/no-unescaped-entities': 'warn',
    '@next/next/no-html-link-for-pages': 'warn',
    'prefer-const': 'warn',
    'import/no-anonymous-default-export': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
