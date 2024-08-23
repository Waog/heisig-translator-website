import 'cypress-file-upload';
import { setupRecordAndReplayOnlineTranslationCache } from './shared/setup-record-and-replay-online-translation-cache';

describe('Anki Import', () => {
  setupRecordAndReplayOnlineTranslationCache(__filename);

  it('should import an anki txt file correctly', () => {
    cy.visit('/');

    // Expect no VocabItems
    cy.contains('Vocabulary').click();
    cy.url().should('include', '/vocabulary');
    cy.contains('.item-count', '#0');

    // navigate to Anki import
    cy.contains('Anki').click();
    cy.contains('Import').click();

    // upload a valid file
    cy.fixture('anki-export.txt').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'anki-export.txt',
        mimeType: 'text/plain',
      });
    });

    // Expect 8 cards
    cy.contains('☑️ [8] items, new').click();

    // create VocabItem from card
    cy.contains('.anki-card-wrapper', '男人').contains('button', '👁️').click();
    cy.contains('2 / 8');
    cy.contains('button.create-btn', 'Create').click();
    cy.contains('2 / 7');

    // Expect 7 remaining cards even after page refresh
    cy.reload();
    cy.contains('☑️ [7] items, new');

    // Expect 1 VocabItems: 男人
    cy.contains('Vocabulary').click();
    cy.contains('.item-count', '#1');
    cy.contains('男人');

    // Create all remaining Items
    cy.contains('Anki').click();
    cy.contains('Import').click();
    cy.contains('☑️ [7] items, new').click();
    cy.contains('button', '👁️').click();
    cy.contains('button', 'Create All').click();
    cy.get('details summary', { timeout: 10000 }).should('not.exist');

    // Modify items to see different import categories:
    // 1. delete 人 people
    cy.contains('Vocabulary').click();
    cy.contains('.item-count', '#8');
    cy.contains('.vocab-item-wrapper', 'people')
      .contains('button', '🗑️')
      .click();
    cy.contains('.item-count', '#7');

    // 2. remove GUID from 天 sky and 天 day
    cy.contains('.vocab-item-wrapper', 'sky').contains('button', '✏️').click();
    cy.contains('app-form-field-text', 'Anki GUID').contains('✏️').click();
    cy.contains('app-form-field-text', 'Anki GUID').find('input').clear();
    cy.contains('app-form-field-text', 'Anki GUID').contains('💾').click();
    cy.contains('.close-button', '❌').click();

    cy.contains('.vocab-item-wrapper', 'day').contains('button', '✏️').click();
    cy.contains('app-form-field-text', 'Anki GUID').contains('✏️').click();
    cy.contains('app-form-field-text', 'Anki GUID').find('input').clear();
    cy.contains('app-form-field-text', 'Anki GUID').contains('💾').click();
    cy.contains('.close-button', '❌').click();

    // 3. remove GUID from 女人 woman
    cy.contains('.vocab-item-wrapper', '女人').contains('button', '✏️').click();
    cy.contains('app-form-field-text', 'Anki GUID').contains('✏️').click();
    cy.contains('app-form-field-text', 'Anki GUID').find('input').clear();
    cy.contains('app-form-field-text', 'Anki GUID').contains('💾').click();
    cy.contains('.close-button', '❌').click();

    // 4. changes values of 女孩 girl
    cy.contains('.vocab-item-wrapper', '女孩').contains('button', '✏️').click();
    cy.contains('app-form-field-textarea', 'English').contains('✏️').click();
    cy.contains('app-form-field-textarea', 'English')
      .find('textarea')
      .clear()
      .type('girlie');
    cy.contains('app-form-field-textarea', 'English').contains('💾').click();
    cy.contains('.close-button', '❌').click();

    // 5. remove GUID and changes values of 我是男人 I am a man
    cy.contains('.vocab-item-wrapper', '我是男人')
      .contains('button', '✏️')
      .click();
    cy.contains('app-form-field-text', 'Anki GUID').contains('✏️').click();
    cy.contains('app-form-field-text', 'Anki GUID').find('input').clear();
    cy.contains('app-form-field-text', 'Anki GUID').contains('💾').click();
    cy.contains('app-form-field-textarea', 'English').contains('✏️').click();
    cy.contains('app-form-field-textarea', 'English')
      .find('textarea')
      .clear()
      .type('blabla');
    cy.contains('app-form-field-textarea', 'English').contains('💾').click();
    cy.contains('.close-button', '❌').click();

    // import the same file again
    cy.contains('Anki').click();
    cy.contains('Import').click();
    cy.fixture('anki-export.txt').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'anki-export.txt',
        mimeType: 'text/plain',
      });
    });

    // expect different cartegories
    cy.contains('✅ [2] items, no changes required (matched by GUID)');
    cy.contains('✅ [1] items, no changes required (matched by Hanzi)'); // 女人 woman
    cy.contains('☑️ [1] items, new'); // 人 people
    cy.contains('⚠️ [1] items, require changes (matched by GUID)'); // 女孩 girl
    cy.contains('⚠️ [1] items, require changes (matched by Hanzi)'); // 我是男人 I am a man
    cy.contains('⚠️ [2] items, with multiple matches'); // 天 sky and 天 day

    // update 我是男人 I am a man
    cy.contains('⚠️ [1] items, require changes (matched by Hanzi)').click();
    cy.contains('.anki-card-wrapper', 'I am a man').contains('👁️').click();
    cy.contains('button', 'Update All').click();
    cy.contains('items, require changes (matched by Hanzi)').should(
      'not.exist'
    );

    // expect 我是男人 I am a man - english to be restored
    cy.contains('Vocabulary').click();
    cy.contains('.item-count', '#7');
    cy.contains('.vocab-item-wrapper', '我是男人').contains('I am a man');
  });
});
