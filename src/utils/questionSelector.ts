import knowledge from "../../public/knowledge.json";

interface KnowledgeItem {
  name: string;
  attributes: string[];
}

const calculateEntropy = (probabilities: number[]): number => {
  return probabilities.reduce((acc, p) => {
    if (p === 0) return acc;
    return acc - p * Math.log2(p);
  }, 0);
};

const getBestQuestion = (
  items: KnowledgeItem[],
  askedQuestions: string[]
): string | null => {
  if (items.length === 0) return null;
  if (items.length === 1) return null;

  const allAttributes = new Set<string>();
  items.forEach((item) => {
    item.attributes.forEach((attr) => {
      if (!askedQuestions.includes(attr)) {
        allAttributes.add(attr);
      }
    });
  });

  if (allAttributes.size === 0) return null;

  let bestAttribute: string | null = null;
  let maxInformationGain = -1;

  allAttributes.forEach((attribute) => {
    const positiveCount = items.filter((item) =>
      item.attributes.includes(attribute)
    ).length;
    const negativeCount = items.length - positiveCount;

    const positiveProbability = positiveCount / items.length;
    const negativeProbability = negativeCount / items.length;

    const initialEntropy = calculateEntropy([positiveProbability, negativeProbability]);

    const positiveEntropy = calculateEntropy([
      items.filter((item) => item.attributes.includes(attribute)).length / items.length,
      items.filter((item) => !item.attributes.includes(attribute)).length / items.length,
    ]);

    const informationGain = initialEntropy - positiveEntropy;

    if (informationGain > maxInformationGain) {
      maxInformationGain = informationGain;
      bestAttribute = attribute;
    }
  });

  return bestAttribute;
};

export default getBestQuestion;