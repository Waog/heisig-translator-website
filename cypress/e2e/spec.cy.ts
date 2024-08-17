describe('Golden Path: Translator Feature', () => {
  const cacheFiles = {
    EN: 'cypress/fixtures/onlineTranslationCacheEN.json',
    DE: 'cypress/fixtures/onlineTranslationCacheDE.json',
  };

  let accumulatedCache = { EN: {}, DE: {} };

  before(() => {
    cy.log(`RECORD_MODE is set to: ${Cypress.env('RECORD_MODE')}`);

    if (Cypress.env('RECORD_MODE')) {
      emptyCache(cacheFiles);
    }
  });

  beforeEach(() => {
    if (!Cypress.env('RECORD_MODE')) {
      fillCacheFromFixture();
    }

    cy.visit('/');
  });

  afterEach(() => {
    if (Cypress.env('RECORD_MODE')) {
      addCacheToFixture();
    }
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

    cy.window().then((win) => {
      win.localStorage.removeItem('onlineTranslationCacheDE');
      win.localStorage.removeItem('onlineTranslationCacheEN');
    });
  });

  function addCacheToFixture() {
    cy.window().then((win) => {
      const cacheEN = JSON.parse(
        win.localStorage.getItem('onlineTranslationCacheEN') || '{}'
      );
      const cacheDE = JSON.parse(
        win.localStorage.getItem('onlineTranslationCacheDE') || '{}'
      );

      accumulatedCache.EN = { ...accumulatedCache.EN, ...cacheEN };
      accumulatedCache.DE = { ...accumulatedCache.DE, ...cacheDE };

      cy.writeFile(cacheFiles.EN, accumulatedCache.EN);
      cy.writeFile(cacheFiles.DE, accumulatedCache.DE);
    });
  }

  function fillCacheFromFixture() {
    cy.fixture('onlineTranslationCacheEN').then((data) => {
      cy.window().then((win) => {
        win.localStorage.setItem(
          'onlineTranslationCacheEN',
          JSON.stringify(data)
        );
      });
    });

    cy.fixture('onlineTranslationCacheDE').then((data) => {
      cy.window().then((win) => {
        win.localStorage.setItem(
          'onlineTranslationCacheDE',
          JSON.stringify(data)
        );
      });
    });
  }

  function emptyCache(cacheFiles: { EN: string; DE: string }) {
    cy.writeFile(cacheFiles.EN, {});
    cy.writeFile(cacheFiles.DE, {});
  }
});
