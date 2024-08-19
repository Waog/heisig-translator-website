import { setupRecordAndReplayOnlineTranslationCache } from './shared/setup-record-and-replay-online-translation-cache';

describe('Translator: Sentence Translation', () => {
  setupRecordAndReplayOnlineTranslationCache(__filename);

  it('should show the translated text by default', () => {
    cy.visit('/');

    cy.contains('app-sentence-translation app-toggle-button', '🐵');

    cy.get('input#userInput').type('你好吗？');
    cy.contains('app-sentence-translation', 'How are you?');
    cy.contains('app-sentence-translation', 'Wie geht es dir?');

    cy.get('app-input-text .reset-button').click();
    cy.get('input#userInput').type('你要咖啡吗？');
    cy.contains('app-sentence-translation', 'Do you want coffee?');
    cy.contains('app-sentence-translation', 'Möchtest du Kaffee?');

    cy.get('app-sentence-translation .blurred').should('have.length', 0);
  });

  it('should hide the translated text when 🙈', () => {
    cy.visit('/');
    cy.get('input#userInput').type('你好吗？');
    cy.contains('app-sentence-translation', 'How are you?');
    cy.contains('app-sentence-translation', 'Wie geht es dir?');

    cy.get('app-input-text .reset-button').click();
    cy.get('input#userInput').type('你要咖啡吗？');
    cy.contains('app-sentence-translation', 'Do you want coffee?');
    cy.contains('app-sentence-translation', 'Möchtest du Kaffee?');

    cy.get('app-sentence-translation .blurred').should('have.length', 0);
    cy.contains('app-sentence-translation app-toggle-button', '🐵').click();
    cy.get('app-sentence-translation .blurred').should('have.length', 1);
    cy.contains('app-sentence-translation app-toggle-button', '🐵').click();
    cy.get('app-sentence-translation .blurred').should('have.length', 2);

    cy.contains('app-sentence-translation app-toggle-button', '🙈').click();
    cy.get('app-sentence-translation .blurred').should('have.length', 1);
    cy.contains('app-sentence-translation app-toggle-button', '🙈').click();
    cy.get('app-sentence-translation .blurred').should('have.length', 0);
  });

  it('should persist the 🙈/🐵 state', () => {
    cy.visit('/');

    const toggleSelector = 'app-sentence-translation app-toggle-button';

    cy.get(toggleSelector).eq(0).should('contain.text', '🐵').click();
    cy.get(toggleSelector).eq(1).should('contain.text', '🐵');

    cy.get(toggleSelector).eq(0).should('contain.text', '🙈');
    cy.get(toggleSelector).eq(1).should('contain.text', '🐵');

    cy.reload();

    cy.get(toggleSelector).eq(0).should('contain.text', '🙈').click();
    cy.get(toggleSelector).eq(1).should('contain.text', '🐵').click();

    cy.get(toggleSelector).eq(0).should('contain.text', '🐵');
    cy.get(toggleSelector).eq(1).should('contain.text', '🙈');

    cy.reload();

    cy.get(toggleSelector).eq(0).should('contain.text', '🐵');
    cy.get(toggleSelector).eq(1).should('contain.text', '🙈');
  });

  it('should read the translation aloud', () => {
    cy.visit('/');
    cy.get('input#userInput').type('你要咖啡吗？');
    cy.contains('app-sentence-translation', 'Do you want coffee?');
    cy.contains('app-sentence-translation', 'Möchtest du Kaffee?');

    stubSpeechSynthesis();

    cy.get('app-sentence-translation').eq(0).contains('button', '🔊').click();
    assertSpeechSynthesis('Do you want coffee?', 'en-US');

    cy.get('app-sentence-translation').eq(1).contains('button', '🔊').click();
    assertSpeechSynthesis('Möchtest du Kaffee?', 'de-DE');
  });
});

describe('Translator: Segmentation', () => {
  setupRecordAndReplayOnlineTranslationCache(__filename);

  it('Sound toggle causes correct sound to play on click of words', () => {
    cy.visit('/');

    cy.get('input#userInput').type('你要咖啡吗？');

    cy.get('app-single-word .pinyin').eq(0).should('contain.text', 'nǐ');
    cy.get('app-single-word .pinyin').eq(1).should('contain.text', 'yào');
    cy.get('app-single-word .pinyin').eq(2).should('contain.text', 'kā');
    cy.get('app-single-word .pinyin').eq(3).should('contain.text', 'fēi');
    cy.get('app-single-word .pinyin').eq(4).should('contain.text', 'ma');

    cy.get('app-single-word .hanzi').eq(0).should('contain.text', '你');
    cy.get('app-single-word .hanzi').eq(1).should('contain.text', '要');
    cy.get('app-single-word .hanzi').eq(2).should('contain.text', '咖');
    cy.get('app-single-word .hanzi').eq(3).should('contain.text', '啡');
    cy.get('app-single-word .hanzi').eq(4).should('contain.text', '吗');

    const heisigSelector = 'app-single-word .heisig';
    cy.get(heisigSelector).eq(0).should('contain.text', 'you');
    cy.get(heisigSelector).eq(1).should('contain.text', 'want (v.)');
    cy.get(heisigSelector).eq(2).should('contain.text', 'coffee (first drop)');
    cy.get(heisigSelector).eq(3).should('contain.text', 'coffee (last drop)');
    cy.get(heisigSelector).eq(4).should('contain.text', 'yes or no');

    const englishSelector = 'app-single-word .word-label';
    cy.get(englishSelector).eq(0).should('contain.text', 'you');
    cy.get(englishSelector).eq(1).should('contain.text', 'want');
    cy.get(englishSelector).eq(2).should('contain.text', 'coffee');
    cy.get(englishSelector).eq(3).should('contain.text', 'question?');

    stubSpeechSynthesis();

    cy.contains('app-segmentation app-toggle-button', 'Off');
    cy.contains('app-single-word .hanzi', '你').click();
    cy.contains(englishSelector, 'coffee').click();
    assertNoSpeechSynthesis();

    cy.contains('app-segmentation app-toggle-button', 'Off').click();
    cy.contains('app-segmentation app-toggle-button', 'Word');
    cy.contains(englishSelector, 'you').click();
    assertSpeechSynthesis('you', 'en-US');
    cy.contains(englishSelector, 'coffee').click();
    assertSpeechSynthesis('coffee', 'en-US');

    cy.contains('app-segmentation app-toggle-button', 'Word').click();
    cy.contains('app-segmentation app-toggle-button', 'Chinese');
    cy.contains('app-single-word .hanzi', '你').click();
    assertSpeechSynthesis('你', 'zh-CN');
    cy.contains(englishSelector, 'coffee').click();
    assertSpeechSynthesis('咖啡', 'zh-CN');

    cy.contains('app-segmentation app-toggle-button', 'Chinese').click();
    cy.contains('app-segmentation app-toggle-button', 'Heisig');
    cy.contains('app-single-word .hanzi', '你').click();
    assertSpeechSynthesis('you', 'en-US');
    cy.contains(englishSelector, 'coffee').click();
    assertSpeechSynthesis('coffee coffee', 'en-US');

    cy.contains('app-segmentation app-toggle-button', 'Heisig').click();
    cy.contains('app-segmentation app-toggle-button', 'Off');
  });

  it('Guess Mode toggle hides stuff', () => {
    cy.visit('/');

    cy.get('input#userInput').type('你要咖啡吗？');

    cy.contains('app-single-word .pinyin', 'nǐ');
    cy.contains('app-single-word .hanzi', '你');
    cy.contains('app-single-word .heisig', 'you');
    cy.contains('app-single-word .word-label', 'you');

    cy.get('app-single-word .hidden').should('have.length', 0);

    cy.contains('app-segmentation app-toggle-button button', '🐵').click();
    cy.contains('app-segmentation app-toggle-button button', '🙈');

    cy.get('app-single-word .word-container.hidden').should(
      'have.length.at.least',
      1
    );
    cy.get('app-single-character .hidden').should('have.length.at.least', 1);

    cy.contains('app-segmentation app-toggle-button button', '🙈').click();
    cy.contains('app-segmentation app-toggle-button button', '🐵');

    cy.get('app-single-word .hidden').should('have.length', 0);
  });
});

function stubSpeechSynthesis() {
  cy.window().then((win) => {
    cy.stub(win.speechSynthesis, 'speak').as('speak');
  });
}

function assertSpeechSynthesis(text: string, lang: string) {
  cy.get('@speak').should(
    'have.been.calledWith',
    Cypress.sinon.match.has('text', text)
  );
  cy.get('@speak').should(
    'have.been.calledWith',
    Cypress.sinon.match.has('lang', lang)
  );

  cy.get('@speak').then((speakStub) => {
    // @ts-ignore
    speakStub.reset();
  });
}

function assertNoSpeechSynthesis() {
  cy.get('@speak').should('not.have.been.called');

  cy.get('@speak').then((speakStub) => {
    // @ts-ignore
    speakStub.reset();
  });
}
