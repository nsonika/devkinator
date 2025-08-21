export type KBItem = Record<string, any>;

/**
 * Calculates the best question to ask based on information gain
 * @param candidates Remaining candidates in the knowledge base
 * @param askedKeys Keys that have already been asked
 * @param schemaKeys All available keys in the schema
 * @returns The best key to ask about next, or null if no good questions remain
 */
export function bestQuestion(
  candidates: KBItem[],
  askedKeys: string[],
  schemaKeys: string[]
): string | null {
  const keys = schemaKeys.filter((k) => !askedKeys.includes(k));
  let best: string | null = null;
  let bestScore = -Infinity;

  for (const key of keys) {
    const counts = new Map<string, number>();
    for (const c of candidates) {
      const v = c[key] === undefined || c[key] === null ? "__MISSING__" : String(c[key]);
      counts.set(v, (counts.get(v) || 0) + 1);
    }
    const total = candidates.length;
    const entropy = -[...counts.values()]
      .map((n) => n / total)
      .reduce((s, p) => s + (p === 0 ? 0 : p * Math.log2(p)), 0);

    if (entropy > bestScore) {
      bestScore = entropy;
      best = key;
    }
  }
  return best;
}

/**
 * Filters candidates based on the user's answer to a question
 * @param candidates Current list of candidates
 * @param key The attribute key that was asked about
 * @param answer The user's answer
 * @returns Filtered list of candidates
 */
export function filterCandidates(
  candidates: KBItem[],
  key: string,
  answer: string
): KBItem[] {
  if (answer === "unknown") return candidates;

  return candidates.filter((c) => {
    const v = c[key];
    if (typeof v === "boolean") {
      if (answer === "yes") return v === true;
      if (answer === "no") return v === false;
      return true;
    }
    return String(v ?? "__MISSING__") === String(answer);
  });
}

/**
 * Returns the top guess from the remaining candidates
 * @param candidates Remaining candidates
 * @returns The top guess or null if no candidates remain
 */
export function topGuess(candidates: KBItem[]): KBItem | null {
  return candidates[0] ?? null;
}
