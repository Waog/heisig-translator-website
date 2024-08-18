import { setupRecordAndReplayOnlineTranslationCache } from './shared/setup-record-and-replay-online-translation-cache';

describe('Golden Path', () => {
  setupRecordAndReplayOnlineTranslationCache(__filename);

  it('Golden Path: input 你好 -> click 你好-word -> click 你-heisig', () => {
    cy.visit('/');
    const userInput = '你好Oli!';
    cy.get('input#userInput').type(userInput);

    cy.get('app-sentence-translation')
      .eq(0)
      .should('contain.text', 'Hello Oli!');
    cy.get('app-sentence-translation')
      .eq(1)
      .should('contain.text', 'Hallo Oli!');

    cy.get('app-single-word').eq(0).should('contain.text', 'hello');
    cy.get('app-single-word').eq(1).should('contain.text', 'Oli');
    cy.get('app-single-word').eq(2).should('contain.text', '!');

    cy.get('app-single-character')
      .eq(0)
      .within(() => {
        cy.get('.pinyin').should('contain.text', 'nǐ');
        cy.get('.hanzi').should('contain.text', '你');
        cy.get('.heisig').should('contain.text', 'you');
      });

    cy.get('app-single-character')
      .eq(1)
      .within(() => {
        cy.get('.pinyin').should('contain.text', 'hǎo');
        cy.get('.hanzi').should('contain.text', '好');
        cy.get('.heisig').should('contain.text', 'good');
      });

    cy.get('app-single-word').eq(0).click();
    cy.get('app-word-details').within(() => {
      cy.get('h1').should('contain.text', 'hello - 你好 - nǐ hǎo');
      cy.get('.translations li').should('contain.text', 'hello');
      cy.get('.translations li').should('contain.text', 'hi');
    });

    cy.get('app-heisig-details')
      .eq(0)
      .within(() => {
        cy.contains('Details').click();
        cy.contains('Show Occurrences').click();
        cy.contains('你我');
        cy.contains('you and I');
      });
  });
});
