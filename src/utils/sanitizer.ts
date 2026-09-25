export const STOP_WORDS = new Set([
  'the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'you', 'this', 
  'for', 'but', 'with', 'are', 'have', 'be', 'at', 'or', 'as', 'was', 'so', 'if', 
  'out', 'not', 'my', 'we', 'me'
]);

export const SENSITIVE_WORDS = new Set([
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'crap', 'cunt', 'dick', 'pussy', 'whore', 'slut'
]);

export interface WordCloudItem {
  word: string;
  size: number;
}

export function filterWordCloud(
  words: { word: string; size: number | string }[]
): WordCloudItem[] {
  return words
    .filter(({ word }) => {
      const lower = word?.toLowerCase();
      if (!lower) return false;
      if (STOP_WORDS.has(lower)) return false;
      if (SENSITIVE_WORDS.has(lower)) return false;
      return true;
    })
    .map(({ word, size }) => ({ word, size: Number(size) }))
    .sort((a, b) => b.size - a.size);
}