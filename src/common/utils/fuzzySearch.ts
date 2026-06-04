import levenshtein from 'js-levenshtein';
export function fuzzySearch<El extends Record<string, unknown>>(
  array: El[],
  searchArg: string,
  getValue: (el: El) => string,
  options: {
    maxAllowedModifications: number;
    caseSensitive?: boolean;
  } = {
    maxAllowedModifications: 1,
    caseSensitive: false,
  },
) {
  const {caseSensitive, maxAllowedModifications} = options;
  const computeBestScore = (
    el: El,
  ): El & {
    bestScore: number;
    partialMatch: boolean;
  } => {
    let value = getValue(el);
    let search = searchArg;
    if (!caseSensitive) {
      value = value.toLowerCase();
      search = search.toLowerCase();
    }

    const words = value.split(' ');
    const searchWords = search.split(' ');

    let bestScore = 1000;
    let partialMatch = false;

    if (value.includes(search)) {
      partialMatch = true;
    }

    for (let i = 0; i < words.length; i++) {
      for (let j = 0; j < searchWords.length; j++) {
        const score = levenshtein(searchWords[j], words[i]);
        if (bestScore > score) {
          bestScore = score;
        }
      }
    }

    return {...el, bestScore, partialMatch};
  };

  return (
    array
      .map(computeBestScore)
      .filter(
        product =>
          product.partialMatch || product.bestScore <= maxAllowedModifications,
      )
      // todo: optimize sorting
      .sort((a, b) => a.bestScore - b.bestScore)
      .sort((a, b) =>
        a.partialMatch == b.partialMatch ? 0 : a.partialMatch ? -1 : 1,
      )
  );
}
