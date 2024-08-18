import { setupRecordAndReplayOnlineTranslationCache } from './shared/setup-record-and-replay-online-translation-cache';

describe('User Input', () => {
  setupRecordAndReplayOnlineTranslationCache(__filename);

  it('should wait for user input to finish', () => {
    cy.visit('/translator');
    cy.get('input#userInput').type('你');
    cy.contains('Waiting until input stops...');
  });
});
