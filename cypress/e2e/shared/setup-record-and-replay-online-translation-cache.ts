let accumulatedCache = { EN: {}, DE: {} };

/** NOTE: This is a workaround, because `Cypress.spec.name` only contains `__all` when running multiple tests at once with the `experimentalRunAllSpecs` feature. */
let _specFileName: string;

export function setupRecordAndReplayOnlineTranslationCache(
  specFileName: string
) {
  _specFileName = specFileName;

  before(() => {
    cy.log(`RECORD_MODE is set to: ${Cypress.env('RECORD_MODE')}`);
    cy.log(`cacheFileFolder: ${cacheFileFolder()}`);

    if (Cypress.env('RECORD_MODE')) {
      emptyCache();
    }
  });

  beforeEach(() => {
    if (!Cypress.env('RECORD_MODE')) {
      fillCacheFromFixture();
    }
  });

  afterEach(() => {
    if (Cypress.env('RECORD_MODE')) {
      addCacheToFixture();
    }
  });
}

function addCacheToFixture() {
  cy.window().then((win) => {
    const cacheEN = JSON.parse(
      win.localStorage.getItem('onlineTranslationCacheEN') || '{}'
    );
    const cacheDE = JSON.parse(
      win.localStorage.getItem('onlineTranslationCacheDE') || '{}'
    );

    accumulatedCache.EN = toSortedObj({ ...accumulatedCache.EN, ...cacheEN });
    accumulatedCache.DE = toSortedObj({ ...accumulatedCache.DE, ...cacheDE });

    cy.writeFile(cacheFileEN(), accumulatedCache.EN);
    cy.writeFile(cacheFileDE(), accumulatedCache.DE);
  });
}

function fillCacheFromFixture() {
  cy.readFile(cacheFileEN()).then((data) => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'onlineTranslationCacheEN',
        JSON.stringify(data)
      );
    });
  });

  cy.readFile(cacheFileDE()).then((data) => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'onlineTranslationCacheDE',
        JSON.stringify(data)
      );
    });
  });
}

function emptyCache() {
  cy.writeFile(cacheFileEN(), {});
  cy.writeFile(cacheFileDE(), {});
}

function cacheFileDE(): string {
  return `${cacheFileFolder()}/onlineTranslationCacheDE.json`;
}

function cacheFileEN(): string {
  return `${cacheFileFolder()}/onlineTranslationCacheEN.json`;
}

function cacheFileFolder(): string {
  return `cypress/fixtures/online-translation-cache/${specName()}`;
}

/**
 * cypress\e2e\golden-path.cy.ts -> golden-path
 * cypress/e2e/golden-path.cy.ts -> golden-path
 * cypress/e2e/subfolder/golden-path.cy.ts -> subfolder/golden-path
 */
function specName(): string {
  return _specFileName
    .replace(/cypress[\\/]e2e[\\/]/, '')
    .replace(/\.cy\.ts$/, '');
}

/**
 * Sorts the keys in an object alphabetically.
 */
function toSortedObj(objectWithUnsortedKeys: Object): Object {
  // Create a new object to store the sorted keys
  const sortedObj: { [key: string]: any } = {};

  // Get the keys, sort them, and then iterate over them
  Object.keys(objectWithUnsortedKeys)
    .sort()
    .forEach((key) => {
      // Add each key-value pair to the new sorted object
      sortedObj[key] = objectWithUnsortedKeys[key];
    });

  // Return the new object with sorted keys
  return sortedObj;
}
