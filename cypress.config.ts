import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '7s4wrz',
  e2e: {
    baseUrl: 'http://localhost:4200/heisig-translator-website ',
    setupNodeEvents(on, config) {
      config.env['RECORD_MODE'] = process.env['RECORD_MODE'] === 'true';
      return config;
    },
    experimentalRunAllSpecs: true,
    experimentalStudio: true,
    viewportWidth: 393, // Xiaomi Redmi Note 10S
    viewportHeight: 736, // Xiaomi Redmi Note 10S
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },
});
