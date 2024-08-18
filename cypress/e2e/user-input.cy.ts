import { setupRecordAndReplayOnlineTranslationCache } from './shared/setup-record-and-replay-online-translation-cache';

describe('User Input', () => {
  setupRecordAndReplayOnlineTranslationCache(__filename);

  it('should wait for user input to finish', () => {
    cy.visit('/translator');
    cy.get('input#userInput').type('你');
    cy.contains('app-sentence-translation', 'Waiting until input stops...');
    cy.contains('app-sentence-translation', 'You');
    cy.contains('app-sentence-translation', 'Du');
  });
});
