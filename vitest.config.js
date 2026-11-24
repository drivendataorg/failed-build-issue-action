import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    // @actions/github reads these when first imported, before any test hook runs,
    // so a developer's shell environment could otherwise redirect its requests.
    env: {
      HTTPS_PROXY: '',
      https_proxy: '',
      HTTP_PROXY: '',
      http_proxy: '',
      GITHUB_API_URL: 'https://api.github.com',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      reporter: ['text', ['html', { subdir: 'html' }], 'json', 'json-summary'],
    },
  },
});
