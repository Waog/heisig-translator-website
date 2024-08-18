import { setupRecordAndReplayOnlineTranslationCache } from './shared/setup-record-and-replay-online-translation-cache';

describe('Navigation', () => {
  setupRecordAndReplayOnlineTranslationCache(__filename);

  it('should navigate to the Translator when entering /', () => {
    cy.visit('/');
    cy.url().should('include', '/translator');
    cy.contains('Enter Chinese Text');
  });

  it('should navigate to Vocabulary List when clicking Vocabulary in the navigation', () => {
    cy.visit('/');
    cy.contains('Vocabulary').click();
    cy.url().should('include', '/vocabulary');
    cy.contains('Vocabulary List');
  });
});
