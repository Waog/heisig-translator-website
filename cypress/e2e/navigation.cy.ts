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
    cy.contains('Find Vocab');
  });

  it('should navigate to Anki Import and Export using the navigation', () => {
    cy.visit('/');
    cy.contains('Anki').click();
    cy.url().should('include', '/anki');

    cy.contains('Import').click();
    cy.url().should('include', '/anki/import');
    cy.contains('Anki Flashcards Import');

    cy.contains('Export').click();
    cy.url().should('include', '/anki/export');
    cy.contains('Anki Flashcards Export');
  });
});
