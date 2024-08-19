export function containsChineseCharacters(text: string): boolean {
  const chineseCharacterRegex = /[\u4e00-\u9fff]/;
  return chineseCharacterRegex.test(text);
}

/**
 * Replaces some heisig strings within the input to make it more smooth to speak.
 *
 * @param input The input string to be processed, containing heisig keywords.
 * @returns The processed string with replaces heisig keyword.
 *
 * Usage example:
 *
 * const result = smoothenHeisig("you want (v.) drink (v.) you bull's eye coffee yes or no?");
 * console.log(result); // "you want drink youish's coffee question?"
 */
export function smoothenHeisig(input: string): string {
  const replacements: { [key: string]: string } = {
    'yes or no': 'question?',
    "bull's eye": `~'s`,
    'how many?': `how many`,
    'who?': `who`,
    'what?': `what`,
    'how?': `how`,
    'which?': `which`,
    '(-ed)': `~ed`,
    '(suffix)': `meh`,
    '(plural)': `plural`,
    '(pause marker)': `pause`,
    '(rhetorical question)': `rhetorical question`,
  };

  // Perform the fixed string replacements
  for (const [key, value] of Object.entries(replacements)) {
    const escapedKey = escapeRegExp(key);
    const regex = new RegExp(escapedKey, 'g');
    input = input.replace(regex, value);
  }

  input = removeBraces(input);

  // Handle special replacement for `~`
  // Examples of transformations:
  // "blue ~ish" becomes "blueish"
  // "light ~hearted" becomes "lighthearted"
  // "semi ~colon" becomes "semicolon"
  input = input.replace(/(\b\w+)\s*~\s*(\w+\b)/g, '$1$2');

  // Handle special case for `~'s`
  // Example: "blue ~'s" becomes "blue's"
  input = input.replace(/(\b\w+)\s*~'s/g, "$1's");

  // Reduce multiple spaces and tabs to a single space
  input = input.replace(/\s+/g, ' ').trim();

  return input;
}

/**
 * Escapes special characters in a string to make it safe for use in a regular expression.
 *
 * @param str The input string to be escaped.
 * @returns The escaped string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Removes everything between braces, brackets, or parentheses from a string.
 *
 * @param input The input string to be cleaned.
 * @returns The cleaned string with all text between braces, brackets, or parentheses removed.
 *
 * Usage example:
 *
 * const result = removeBraces("hello (aux.) you [bla] fox !");
 * console.log(result); // "hello you fox !"
 */
export function removeBraces(input: string): string {
  return input.replace(/\(.*?\)|\[.*?\]|\{.*?\}/g, '').trim();
}
