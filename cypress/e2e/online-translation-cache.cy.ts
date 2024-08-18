import { setupRecordAndReplayOnlineTranslationCache } from './shared/setup-record-and-replay-online-translation-cache';

describe('Online Translation Cache', () => {
  setupRecordAndReplayOnlineTranslationCache(__filename);

  it('should use cached translations from localStorage', () => {
    cy.visit('/translator');
    cy.window().then((win) => {
      win.localStorage.setItem(
        'onlineTranslationCacheDE',
        '{"你好":"Hallo Mock!"}'
      );
      win.localStorage.setItem(
        'onlineTranslationCacheEN',
        '{"你好":"Hello Mock!"}'
      );
    });

    cy.get('input#userInput').type('你好');

    cy.contains('Hallo Mock!');
    cy.contains('Hello Mock!');

    cy.window().then((win) => {
      win.localStorage.removeItem('onlineTranslationCacheDE');
      win.localStorage.removeItem('onlineTranslationCacheEN');
    });
  });
});
