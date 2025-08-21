const API = "https://api.z.ai/api/paas/v4/chat/completions";

/**
 * Uses GLM-4.5 to generate a humorous rephrasing of a question
 * @param key The attribute key being asked about
 * @param values Possible values for this attribute
 * @param base The base question text
 * @param tone The humor tone (gentle, snark, unhinged)
 * @returns A witty rephrased question
 */
export async function humorizeQuestion(
  key: string,
  values: string[],
  base: string,
  tone: string = "snark"
): Promise<string> {
  if (!process.env.ZAI_API_KEY) return base; // no-op without key

  const body = {
    model: "glm-4.5",
    messages: [
      {
        role: "user",
        content: `You're a funny developer Akinator with a ${tone} tone. Rephrase this question with witty, meme-like tone, short and punchy.
Attribute: ${key}
Values seen: ${values.join(", ")}
Base question: "${base}"
Return ONLY the rephrased question.`,
      },
    ],
  };

  try {
    const r = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ZAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const j = await r.json();
    return j?.choices?.[0]?.message?.content?.trim() || base;
  } catch {
    return base;
  }
}

/**
 * Generates a witty roast response based on the user's answer
 * @param key The attribute key that was asked about
 * @param answer The user's answer
 * @param tone The humor tone (gentle, snark, unhinged)
 * @returns A humorous roast response
 */
export async function generateRoast(
  key: string,
  answer: string,
  tone: string = "snark"
): Promise<string> {
  if (!process.env.ZAI_API_KEY) {
    // Fallback roasts if no API key is available
    const fallbacks = {
      gentle: [
        "wholesome take. you probably write comments too.",
        "nice. neat. tidy. unlike my npm cache.",
        "cute answer. must be a typescript person."
      ],
      snark: [
        "bold choice. did chatgpt suggest it?",
        "spicy. like your prod logs at 3am.",
        "that answer screams 'it works on my machine' energy."
      ],
      unhinged: [
        "ok mr/mrs microservice. deploy your feelings separately.",
        "this answer uses 9GB RAM idle. respect.",
        "architected by committee, certified by chaos."
      ]
    };
    
    const pool = fallbacks[tone as keyof typeof fallbacks] || fallbacks.snark;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const body = {
    model: "glm-4.5",
    messages: [
      {
        role: "user",
        content: `You're a witty developer Akinator with a ${tone} tone. Generate a short, funny roast (max 10 words) based on this user's answer.
Question attribute: ${key}
User's answer: ${answer}
Return ONLY the roast, no quotes or explanations.`,
      },
    ],
  };

  try {
    const r = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ZAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const j = await r.json();
    return j?.choices?.[0]?.message?.content?.trim() || "that answer has strong 'it works on my machine' energy.";
  } catch {
    return "that answer has strong 'it works on my machine' energy.";
  }
}

/**
 * Generates a celebratory animation prompt for CogVideoX-3
 * @param guess The correctly guessed technology
 * @returns A video generation prompt
 */
export async function generateCelebrationPrompt(guess: string): Promise<string> {
  if (!process.env.ZAI_API_KEY) {
    return `${guess} celebration with confetti and developer memes`;
  }

  const body = {
    model: "glm-4.5",
    messages: [
      {
        role: "user",
        content: `Create a fun, creative prompt for CogVideoX-3 to generate a celebratory animation for correctly guessing the technology: ${guess}.
The prompt should be humorous, developer-themed, and mention ${guess} specifically.
Return ONLY the prompt text, no explanations.`,
      },
    ],
  };

  try {
    const r = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ZAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const j = await r.json();
    return j?.choices?.[0]?.message?.content?.trim() || `${guess} celebration with confetti and developer memes`;
  } catch {
    return `${guess} celebration with confetti and developer memes`;
  }
}
