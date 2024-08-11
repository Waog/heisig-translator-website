# SUBTLEX-CH

## Overview

SUBTLEX-CH provides Simplified Chinese word frequency and word frequency based on the film and television subtitle corpus.
Compared with the growing research needs, available Chinese word frequency resources are scarce, especially those for multi-character words. Therefore, we established a SUBTLEX-CH simplified Chinese subtitle corpus of 47 million words (33 million words), performed word segmentation and part-of-speech tagging, and provided word frequency, word frequency, part-of-speech (PoS), and Word frequency with part of speech.
Similar to the previous research results of New, Brysbaert and other colleagues on word frequency in English, French and Dutch based on subtitle corpus, we conducted test analysis on the response time of word naming and part-of-speech test (lexical decision) tasks. The results show that , the word/word frequency provided by SUBTLEX-CH has significantly better explanatory power on behavioral data of vocabulary reading than other currently available word/word frequencies. In addition, SUBTLEX-CH provides for the first time the contextual diversity (number/percentage of videos in which the word appears) data on Chinese words, as well as the part-of-speech and part-of-speech frequency of multi-character words.
We provide a variety of online inquiries, as well as free downloads for non-commercial use.
Technical implementation, related literature and databases, and more information, see:
Cai, Q. & Brysbaert, M. (2010). SUBTLEX-CH: Chinese Word and Character Frequencies Based on Film Subtitles. PLoS ONE.

## Source

From https://www.ugent.be/pp/experimentele-psychologie/en/research/documents/subtlexch

> These are the Chinese word frequencies discussed in the Plos ONE article of Cai & Brysbaert, which you find here. The article explains what is in the files. So, this will not be repeated here.
>
> If you use the frequencies for your research, please refer to us as follows:
>
> Cai, Q., & Brysbaert, M. (2010). SUBTLEX-CH: Chinese Word and Character Frequencies Based on Film Subtitles. Plos ONE, 5(6), e10729.
>
> - SUBTLEX-CH-CHR.zip : download the character frequencies
> - SUBTLEX-CH-WF.zip : download the word frequencies
> - SUBTLEX-CH-WF_PoS.zip : download the word frequencies according to the different syntactic roles of the words
>
> We have now added a file in which the word form frequencies and the PoS frequencies are integrated. This file not only gives the total word form frequency of the word, but also the frequencies of the different parts of speech taken by the word. Furthermore, you get information about the dominant PoS of the word (is it a noun, a verb, an adjective, or another word?), the pinyin notation, and the most frequent English translations (see the file with further information).
>
> - Download a Word file with information about the new combined word frequency and PoS file
> - Download a Word file with information about the codes used in the PKU PoS system
> - Download the zipped UTF8-file of the combined word frequency and PoS file (this file can easily be opened with most existing software)
> - Download Ch_LexD.xls, the lexical decision data we collected and used in this study (399 words and 394 non-words, based on 12 subjects).

# information about the new combined word frequency and PoS file

## Word

## Length

Number of characters in the word.

## W.million

Fequency of the word in SUBTLEX-CH per million words (on a total of 33.5 million words).

## Dominant.PoS

Part of speech (PoS) of the word with the highest frequency in SUBTLEX-CH
(Peiking University (PKU) PoS tagging set, for more info see Appendix)

## Dominant.PoS.Freq

Frequency of the dominant PoS taken by the word.

## All.PoS

All Parts of Speech taken by the word in SUBLEX-CH.

## All.PoS.Freq

Frequency of each PoS taken by the word.

## Pinyin

Pinyin with tone numbers, based on CEDict (Chinese-English dictionary; http://www.mdbg.net/chindict/chindict.php?page=cedict, checked 12-12-2010) and pinyin table in GB2312 code (http://download.csdn.net/source/1992252, checked 09-12-2010).
For multiple-character words existed in CEDict, pinyin are taken from CEDict; for single-character polyphonic words and multiple-character words not existed in CEDict, all candidate pinyin of each character are listed, separated by slashes. Very rough manual check has been done by a native Chinese speaker.

## Pinyin.Input

Pinyin (without tone) of the word, as used in Chinese pinyin input methods for computers. For polyphonic characters, the most frequent pinyin were automatically taken and then corrected for an incomplete list of known polyphonic words. Very rough manual check has been done by a native Chinese speaker. For reference only.

## WCount

Number of times the word is encountered in SUBTLEX-CH (on a total of 33.5 million words).

## log10W

Log10 of the word frequency as given in SUBTLEX-CH (i.e., log10 of WCount).

## W-CD

Number of films in SUBTLEX-CH with the word (on a total of 6,243).

## W-CD%

Percentage of films in SUBTLEX-CH with the word (on a total of 6,243).

## log10CD

Log10 of the number of films with the word (i.e., W-CD).

## Eng.Tran

English translation based on CEDict (http://www.mdbg.net/chindict/chindict.php?page=cedict, checked 12-12-2010). For reference only.

# PKU PoS system labels

Supporting Table 1. Labels used in the PKU PoS system.

| Label | Description                           |
| ----- | ------------------------------------- |
| a     | adjective                             |
| ad    | adjective as adverbial                |
| ag    | adjective morpheme                    |
| an    | adjective with nominal function       |
| b     | non-predicate adjective               |
| c     | conjunction                           |
| d     | adverb                                |
| dg    | adverb morpheme                       |
| e     | interjection                          |
| f     | directional locality                  |
| g     | morpheme                              |
| h     | prefix                                |
| i     | idiom                                 |
| j     | abbreviation                          |
| k     | suffix                                |
| l     | fixed expressions                     |
| m     | numeral                               |
| mg    | numeric morpheme                      |
| n     | common noun                           |
| ng    | noun morpheme                         |
| nr    | personal name                         |
| ns    | place name                            |
| nt    | organization name                     |
| nx    | nominal character string              |
| nz    | other proper noun                     |
| o     | onomatopoeia                          |
| p     | preposition                           |
| q     | classifier                            |
| r     | pronoun                               |
| rg    | pronoun morpheme                      |
| s     | space word                            |
| t     | time word                             |
| tg    | time word morpheme                    |
| u     | auxiliary                             |
| v     | verb                                  |
| vd    | verb as adverbial                     |
| vg    | verb morpheme                         |
| vn    | verb with nominal function            |
| w     | symbol and non-sentential punctuation |
| x     | unclassified items                    |
| y     | modal particle                        |
| z     | descriptive                           |
