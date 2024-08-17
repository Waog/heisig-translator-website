describe('Golden Path: Translator Feature', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to the Translator when entering /', () => {
    cy.visit('/translator');
    cy.url().should('include', '/translator');
    cy.contains('Enter Chinese Text');
  });

  it('should navigate to Vocabulary List when clicking Vocabulary in the navigation', () => {
    cy.visit('/');
    cy.contains('Vocabulary').click();
    cy.url().should('include', '/vocabulary');
    cy.contains('Vocabulary List');
  });

  it('should wait for user input to finish', () => {
    cy.visit('/translator');
    cy.get('input#userInput').type('你');

    cy.contains('Waiting until input stops...');
  });

  it('Golden Path: input 你好 -> click 你好-word -> click 你-heisig', () => {
    cy.visit('/translator');
    const userInput = '你好Oli!';
    cy.get('input#userInput').type(userInput);

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
  });
});
