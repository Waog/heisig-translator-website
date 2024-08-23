export interface AnkiCard {
  guid: string | undefined;
  index: number | undefined;
  hanzi: string;
  english: string;
  pinyin: string;
  sound: string;
  overrideTTS: string;
  heisigKeywords: string;
  image: string;
  skill: string;
  lesson: string;
  notes: string;
}
