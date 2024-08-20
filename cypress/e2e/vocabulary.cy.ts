import { setupRecordAndReplayOnlineTranslationCache } from './shared/setup-record-and-replay-online-translation-cache';

describe('Vocabulary', () => {
  setupRecordAndReplayOnlineTranslationCache(__filename);

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.removeItem('vocabList_v1');
    });
  });

  it('should filter', () => {
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
    cy.contains('.navigate-vocabulary-btn', '🗂️').click();
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

    // Reset filter
    cy.get('.reset-button').click();
    cy.get('.vocab-item-wrapper').should('have.length', 4);

    // filter buttons
    cy.contains('app-toggle-button button', 'to export: 🤷').click();
    cy.contains('app-toggle-button', 'to export: ✔️');
    cy.get('.vocab-item-wrapper').should('have.length', 4);

    cy.contains('app-toggle-button button', 'to export: ✔️').click();
    cy.contains('app-toggle-button', 'to export: ❌');
    cy.get('.vocab-item-wrapper').should('have.length', 0);

    cy.contains('app-toggle-button button', 'to export: ❌').click();
    cy.contains('app-toggle-button', 'to export: 🤷');
    cy.get('.vocab-item-wrapper').should('have.length', 4);

    cy.contains('app-toggle-button button', 'all').click();
    cy.contains('app-toggle-button', 'word');
    cy.contains('.vocab-item-wrapper', '你');
    cy.contains('.vocab-item-wrapper', 'you');
    cy.contains('.vocab-item-wrapper', '咖啡');
    cy.contains('.vocab-item-wrapper', 'coffee');
    cy.get('.vocab-item-wrapper').should('have.length', 2);

    cy.contains('.edit-btn', '✏️').click();
    cy.contains('app-vocab-carousel', '1 / 2');
    cy.contains('.close-button', '❌').click();

    cy.contains('app-toggle-button button', 'word').click();
    cy.contains('app-toggle-button', 'sentence');
    cy.contains('.vocab-item-wrapper', '你要喝咖啡吗？');
    cy.contains('.vocab-item-wrapper', 'Would you like a coffee?');
    cy.contains('.vocab-item-wrapper', '你好吗？');
    cy.contains('.vocab-item-wrapper', 'How are you?');
    cy.get('.vocab-item-wrapper').should('have.length', 2);

    cy.contains('app-toggle-button button', 'sentence').click();
    cy.contains('app-toggle-button', 'all');
    cy.get('.vocab-item-wrapper').should('have.length', 4);

    cy.get('.edit-btn').eq(1).click();
    cy.contains('app-vocab-carousel', '2 / 4');
  });

  it('carousel should show correct items, allow editing items, saving and discarding', () => {
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

    // Navigate to Vocabulary
    cy.contains('.bottom-nav a', 'Vocabulary').click();
    cy.url().should('include', '/vocabulary');

    // edit '你要喝咖啡吗？'
    cy.contains('.vocab-item-wrapper', '你要喝咖啡吗？')
      .contains('button', '✏️')
      .click();
    cy.contains('app-form-field-textarea', 'Hanzi')
      .find('input')
      .should('have.value', '你要喝咖啡吗？');
    cy.contains('app-form-field-textarea', 'English')
      .find('input')
      .invoke('val')
      .should('include', 'Would you like a coffee?');

    cy.contains('app-form-field-textarea', 'Pinyin')
      .find('input')
      .invoke('val')
      .should('include', 'nǐ yào hē kā fēi ma');

    cy.contains('app-form-field-textarea', 'Heisig')
      .find('input')
      .should(
        'have.value',
        'you, want (v.), drink (v.), coffee (first drop), coffee (last drop), yes or no, ？'
      );

    // editing is persisted
    cy.contains('app-form-field-textarea', 'English')
      .contains('button', '✏️')
      .click();
    cy.contains('app-form-field-textarea', 'English')
      .find('textarea')
      .invoke('val')
      .should('include', 'Would you like a coffee?');
    cy.contains('app-form-field-textarea', 'English')
      .find('textarea')
      .clear()
      .type('Do you want coffee?');
    cy.contains('app-form-field-textarea', 'English')
      .contains('button', '💾')
      .click();
    cy.contains('app-form-field-textarea', 'English')
      .find('input')
      .invoke('val')
      .should('include', 'Do you want coffee?');

    cy.reload();

    cy.contains('.vocab-item-wrapper', 'Do you want coffee?');

    // editing can be discarded
    cy.contains('.vocab-item-wrapper', '你要喝咖啡吗？')
      .contains('button', '✏️')
      .click();
    cy.contains('app-form-field-textarea', 'English')
      .contains('button', '✏️')
      .click();
    cy.contains('app-form-field-textarea', 'English')
      .find('textarea')
      .invoke('val')
      .should('include', 'Do you want coffee?');
    cy.contains('app-form-field-textarea', 'English')
      .find('textarea')
      .clear()
      .type('Some mistake to be discarded');
    cy.contains('app-form-field-textarea', 'English')
      .find('textarea')
      .invoke('val')
      .should('include', 'Some mistake to be discarded');
    cy.contains('app-form-field-textarea', 'English')
      .contains('button', '❌')
      .click();
    cy.contains('app-form-field-textarea', 'English')
      .find('input')
      .invoke('val')
      .should('include', 'Do you want coffee?');

    cy.reload();

    cy.contains('.vocab-item-wrapper', 'Do you want coffee?');
  });
});
