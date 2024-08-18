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
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },
});
