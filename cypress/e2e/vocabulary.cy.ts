import { setupRecordAndReplayOnlineTranslationCache } from './shared/setup-record-and-replay-online-translation-cache';

describe('Vocabulary', () => {
  setupRecordAndReplayOnlineTranslationCache(__filename);

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.removeItem('vocabList_v1');
    });
  });

  it('should filter by free text search filter input /', () => {
    cy.visit('/');

    // ADD 'How are you?' / 你好吗？ and words
    cy.get('#userInput').type('你好吗？');
    cy.get('app-input-text app-favorite-button button').click();
    cy.contains('app-single-word', 'you').click();
    cy.get('app-word-details app-favorite-button button').click();
    cy.contains('app-sentence-translation', 'How are you?');
    cy.contains('app-sentence-translation', 'Wie geht es dir?');

    // ADD 'Do you want coffee?` / 你要喝咖啡吗？ and words
    cy.get('app-input-text .reset-button').click();
    cy.get('#userInput').type('你要喝咖啡吗？');
    cy.get('app-input-text app-favorite-button button').click();
    cy.contains('app-single-word', 'you').click(); // 'you' already added, extending it's source list
    cy.get('app-word-details app-favorite-button button').click();
    cy.contains('app-single-word', 'coffee').click();
    cy.get('app-word-details app-favorite-button button').click();
    cy.contains('app-sentence-translation', 'Would you like a coffee?');
    cy.contains('app-sentence-translation', 'Möchtest du einen Kaffee?');

    // Navigate to Coffee VocabItem
    cy.get('.navigate-vocabulary-btn').click();
    cy.url()
      .should('include', '/vocabulary')
      .and('include', `searchFilter=${encodeURIComponent('咖啡')}`);
    cy.get('.vocab-item-wrapper').first().should('contain.text', '咖啡');
    cy.get('.vocab-item-wrapper').first().should('contain.text', 'coffee');
    cy.contains('.vocab-item-wrapper', '你要喝咖啡吗？');
    cy.contains('.vocab-item-wrapper', 'Would you like a coffee?');
    cy.get('.vocab-item-wrapper').should('have.length', 2);

    // Reset filter
    cy.get('.reset-button').click();
    cy.get('.vocab-item-wrapper').should('have.length', 4);

    // Search for 'How are you?' in english
    cy.get('.reset-button').click();
    cy.get('#searchFilter').type('How are you?{enter}');
    cy.get('.vocab-item-wrapper').first().should('contain.text', '你好吗？');
    cy.get('.vocab-item-wrapper')
      .first()
      .should('contain.text', 'How are you?');
    cy.get('.vocab-item-wrapper').should('have.length', 1);

    // Search for '你要喝咖啡吗？' in chinese
    cy.get('.reset-button').click();
    cy.get('#searchFilter').type('你要喝咖啡吗？{enter}');
    cy.get('.vocab-item-wrapper')
      .first()
      .should('contain.text', '你要喝咖啡吗？');
    cy.get('.vocab-item-wrapper')
      .first()
      .should('contain.text', 'Would you like a coffee?');
    cy.get('.vocab-item-wrapper').should('have.length', 1);
  });
});
