import {
  preparedAnswers,
  type PreparedAnswerDefinition,
} from "@/lib/data/cli-answers";

export type PreparedAnswerMatch = {
  id: string;
  response: string;
};

type ScoredAnswer = {
  answer: PreparedAnswerDefinition;
  index: number;
  score: number;
};

export function normalizeQuestion(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function scoreAnswer(
  normalizedInput: string,
  inputTokens: ReadonlySet<string>,
  answer: PreparedAnswerDefinition,
  index: number
): ScoredAnswer | null {
  const exactAlias = answer.aliases.some(
    (alias) => normalizeQuestion(alias) === normalizedInput
  );

  if (exactAlias) {
    return { answer, index, score: 10_000 + answer.priority };
  }

  if (answer.keywords.length === 0) return null;

  const keywordMatches = answer.keywords.reduce(
    (count, keyword) => count + Number(inputTokens.has(normalizeQuestion(keyword))),
    0
  );

  if (keywordMatches < answer.minimumKeywordMatches) return null;

  return {
    answer,
    index,
    score: keywordMatches * 100 + answer.priority,
  };
}

export function findPreparedAnswer(input: string): PreparedAnswerMatch | null {
  const normalizedInput = normalizeQuestion(input);
  if (!normalizedInput) return null;

  const inputTokens = new Set(normalizedInput.split(" "));
  let bestMatch: ScoredAnswer | null = null;

  for (const [index, answer] of preparedAnswers.entries()) {
    const candidate = scoreAnswer(normalizedInput, inputTokens, answer, index);
    if (!candidate) continue;

    if (
      !bestMatch ||
      candidate.score > bestMatch.score ||
      (candidate.score === bestMatch.score && candidate.index < bestMatch.index)
    ) {
      bestMatch = candidate;
    }
  }

  if (bestMatch === null) return null;
  return {
    id: bestMatch.answer.id,
    response: bestMatch.answer.response,
  };
}
