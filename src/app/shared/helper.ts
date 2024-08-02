export function containsChineseCharacters(text: string): boolean {
  const chineseCharacterRegex = /[\u4e00-\u9fff]/;
  return chineseCharacterRegex.test(text);
}
