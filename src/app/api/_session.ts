import fs from "fs";
import path from "path";
import { bestQuestion, filterCandidates, topGuess } from "../../utils/inference";
import { humorizeQuestion } from "../../utils/llm";

type Session = { 
  candidates: any[]; 
  asked: string[]; 
  qa: Array<{key: string; answer: string}>; 
  tone: string;
};

// Load knowledge base from JSON file
const KB = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/knowledge.json"), "utf-8"));
const SCHEMA_KEYS = ["type", "domain", "language", "ui", "db", "realtime", "company"];
const sessions = new Map<string, Session>();
const newId = () => Math.random().toString(36).slice(2);

/**
 * Starts a new game session
 * @returns Session ID and number of remaining candidates
 */
export function startSession() {
  const id = newId();
  sessions.set(id, { 
    candidates: [...KB], 
    asked: [], 
    qa: [],
    tone: "snark" 
  });
  return { id, remaining: KB.length };
}

/**
 * Gets the next best question to ask
 * @param id Session ID
 * @param tone Humor tone (gentle, snark, unhinged)
 * @returns Question object or guess if confidence is high
 */
export async function nextQuestion(id: string, tone: string = "snark") {
  const s = sessions.get(id);
  if (!s) return { error: "no session" as const };
  
  // Update tone if provided
  if (tone) {
    s.tone = tone;
  }
  
  // If we have 2 or fewer candidates, make a guess
  if (s.candidates.length <= 2) {
    return { kind: "guess" as const, guess: topGuess(s.candidates) };
  }

  // Find the best question to ask next
  const key = bestQuestion(s.candidates, s.asked, SCHEMA_KEYS);
  if (!key) return { kind: "guess" as const, guess: topGuess(s.candidates) };
  s.asked.push(key);

  // Get unique values for this key
  const values = [...new Set(s.candidates.map((c) => String(c[key] ?? "__MISSING__")))];
  
  // Create base question text
  const base =
    key === "ui" || key === "db" || key === "realtime"
      ? `Is it ${key.toUpperCase()} related? (yes/no/unknown)`
      : `Which ${key} is it? (${values.join(", ")})`;

  // Humorize the question with GLM-4.5 if available
  const prompt = await humorizeQuestion(key, values, base, s.tone);
  
  return { 
    kind: "question" as const, 
    key, 
    prompt, 
    options: values, 
    remaining: s.candidates.length 
  };
}

/**
 * Processes the user's answer to a question
 * @param id Session ID
 * @param key The attribute key that was asked
 * @param answer The user's answer
 * @returns Next state (continue or guess)
 */
export function submitAnswer(id: string, key: string, answer: string) {
  const s = sessions.get(id);
  if (!s) return { error: "no session" as const };
  
  // Filter candidates based on the answer
  s.candidates = filterCandidates(s.candidates, key, answer);
  s.qa.push({ key, answer });
  
  // If we have 2 or fewer candidates, make a guess
  if (s.candidates.length <= 2)
    return { 
      kind: "guess" as const, 
      guess: topGuess(s.candidates), 
      remaining: s.candidates 
    };
    
  return { 
    kind: "continue" as const, 
    remaining: s.candidates.length 
  };
}

/**
 * Forces a guess even if confidence is low
 * @param id Session ID
 * @returns Best guess based on current state
 */
export function forceGuess(id: string) {
  const s = sessions.get(id);
  if (!s) return { error: "no session" as const };
  return { 
    guess: topGuess(s.candidates), 
    remaining: s.candidates 
  };
}

/**
 * Updates the tone setting for a session
 * @param id Session ID
 * @param tone New tone setting
 * @returns Success status
 */
export function updateTone(id: string, tone: string) {
  const s = sessions.get(id);
  if (!s) return { error: "no session" as const };
  s.tone = tone;
  return { success: true };
}
