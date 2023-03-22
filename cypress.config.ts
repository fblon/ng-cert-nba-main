import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    apiUrl: "https://free-nba.p.rapidapi.com"
  },
  e2e: {
    baseUrl: 'http://localhost:4200/',
    specPattern: "cypress/tests/**/*.cy.ts",
    setupNodeEvents(on, config) {
      if (config.isTextTerminal) {
        // skip the all.cy.js spec in "cypress run" mode
        return {
          excludeSpecPattern: ['cypress/tests/all.cy.ts'],
        }
      }
    },    
  },
});
