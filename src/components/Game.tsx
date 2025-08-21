"use client";

import React, { useEffect, useRef, useState } from "react";

type AskResponse =
  | { kind: "question"; key: string; prompt: string; options: string[]; remaining: number }
  | { kind: "guess"; guess: KBItem | null };

type AnswerResponse =
  | { kind: "continue"; remaining: number; roast?: string }
  | { kind: "guess"; guess: KBItem | null; remaining: KBItem[]; roast?: string };

type KBItem = {
  name: string;
  type: string;
  domain: string;
  language: string;
  ui: boolean;
  db: boolean;
  realtime: boolean;
  company: string;
};

// Fallback zingers for when not using GLM-4.5
const zingers = {
  gentle: [
    "wholesome take. you probably write comments too.",
    "nice. neat. tidy. unlike my npm cache.",
    "cute answer. must be a typescript person.",
  ],
  snark: [
    "bold choice. did chatgpt suggest it?",
    "spicy. like your prod logs at 3am.",
    "that answer screams 'it works on my machine' energy.",
  ],
  unhinged: [
    "ok mr/mrs microservice. deploy your feelings separately.",
    "this answer uses 9GB RAM idle. respect.",
    "architected by committee, certified by chaos.",
  ],
  askOpeners: ["hmm… thinking 🧠", "ok but like", "real talk:", "unpopular opinion:"],
  booleanPrompts: {
    ui: ["Does it touch the DOM, or is it backend gremlin work? (yes/no/unknown)"],
    db: ["Is it married to storage life? (yes/no/unknown)"],
    realtime: ["Does it vibe in real‑time or is it a batch dinosaur? (yes/no/unknown)"],
  },
};

export default function Game() {
  const [session, setSession] = useState<string | null>(null);
  const [question, setQuestion] = useState<Extract<AskResponse, { kind: "question" }> | null>(null);
  const [guess, setGuess] = useState<KBItem | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [tone, setTone] = useState<"gentle" | "snark" | "unhinged">("snark");
  const [zinger, setZinger] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [guessRevealed, setGuessRevealed] = useState<boolean>(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Log messages to the transcript panel
  const log = (m: string) => {
    const el = logRef.current;
    if (!el) return;
    el.textContent += m + "\n";
    el.scrollTop = el.scrollHeight;
  };

  // Get a random zinger based on the current tone
  const zing = () => {
    const pool = (zingers as any)[tone] as string[];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Get a random question opener
  const opener = () => zingers.askOpeners[Math.floor(Math.random() * zingers.askOpeners.length)];

  // Start a new game
  async function newGame() {
    setLoading(true);
    try {
      const r = await fetch("/api/new", { method: "POST" });
      const j = await r.json();
      setSession(j.id);
      setRemaining(j.remaining);
      setGuess(null);
      setZinger("game on. try not to pick 'React'. everyone picks React.");
      setGuessRevealed(false);
      setCelebration(null);
      log("🎮 new game started");
      await nextQuestion(j.id);
    } catch (error) {
      setZinger("Error starting game. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  // Get the next question
  async function nextQuestion(id = session) {
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetch("/api/ask", { 
        method: "POST", 
        body: JSON.stringify({ id, tone }), 
        headers: { "Content-Type": "application/json" } 
      });
      const j: AskResponse = await r.json();

      if (j.kind === "guess") {
        setQuestion(null);
        setGuess(j.guess);
        return;
      }

      // Humorize the question if it's not already done by the API
      let qText = j.prompt;
      if (["ui", "db", "realtime"].includes(j.key) && !qText.includes("?")) {
        const arr = (zingers as any).booleanPrompts[j.key] as string[];
        qText = arr[Math.floor(Math.random() * arr.length)];
      } else if (!qText.includes("?")) {
        qText = `${opener()} ${j.prompt} ${["(pls no bike‑shedding)", "(no framework wars)", "(be honest)"][Math.floor(Math.random() * 3)]}`;
      }

      setQuestion({ ...j, prompt: qText });
      setRemaining(j.remaining);
      setZinger(zing());
    } catch (error) {
      setZinger("Error getting question. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  // Submit an answer to a question
  async function submitAnswer(ans: string) {
    if (!session || !question) return;
    setLoading(true);
    try {
      log(`Q(${question.key}): ${question.prompt}\nA: ${ans}`);
      const r = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session, key: question.key, answer: ans, tone }),
      });
      const j: AnswerResponse = await r.json();
      
      // Use the roast from the API if available, otherwise use a fallback
      if (j.roast) {
        setZinger(j.roast);
      } else {
        setZinger(zing());
      }
      
      if (j.kind === "guess") {
        setGuess(j.guess);
        setQuestion(null);
      } else {
        setRemaining(j.remaining);
        await nextQuestion();
      }
    } catch (error) {
      setZinger("Error submitting answer. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  // Force a guess even if confidence is low
  async function forceGuess() {
    if (!session) return;
    setLoading(true);
    try {
      const r = await fetch("/api/guess", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ id: session }) 
      });
      const j = await r.json();
      setGuess(j.guess);
      setZinger("fine. here's my hot take.");
    } catch (error) {
      setZinger("Error making guess. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  // Reveal the final guess with celebration
  async function revealGuess() {
    if (!guess) return;
    setGuessRevealed(true);
    log(`🧠 final guess: ${guess.name}`);
    setZinger(`${guess.name}? ship it. if prod breaks, it was a feature.`);
    
    // Generate celebration animation if API key is available
    try {
      const r = await fetch("/api/celebrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: guess.name }),
      });
      const j = await r.json();
      
      if (j.error && j.fallbackUrl) {
        setCelebration(j.fallbackUrl);
      } else if (j.data && j.data.url) {
        setCelebration(j.data.url);
      }
    } catch (error) {
      // Use fallback celebration if API call fails
      setCelebration("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDFtNXJnOWRxZWZxcmFwcXRwcWVtZDRxZXZnMmRmZXFmMWQ5ZXlxdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Rsp9jLIy0VZOKlZnd8/giphy.gif");
    }
  }

  // Share on Twitter
  function tweet() {
    const g = guess?.name ?? "something mysterious";
    const text = encodeURIComponent(
      `Devkinator (roast mode) guessed ${g} in style. #CodingwithGLM #Devkinator`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  // Styling functions
  const card = (): React.CSSProperties => ({
    background: "#0f1621",
    border: "1px solid #213043",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 8px 20px rgba(0,0,0,.35)",
    marginBottom: 16,
  });
  
  const badge = (): React.CSSProperties => ({
    background: "#0b1017",
    border: "1px solid #1b2940",
    padding: "6px 8px",
    borderRadius: 10,
    fontSize: 12,
    color: "#9fb0c6",
    display: "inline-block",
    margin: "0 4px 4px 0",
  });
  
  const button = (accent = false): React.CSSProperties => ({
    background: accent ? "linear-gradient(180deg,#223612,#1a2c0b)" : "#192537",
    border: accent ? "1px solid #2c4d12" : "1px solid #28374a",
    color: accent ? "#d9f99d" : "#f8fafc",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    marginRight: 8,
    marginBottom: 8,
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
      <div>
        <div style={card()}>
          <div style={{ fontSize: 18, fontWeight: 700, margin: "8px 0 6px" }}>
            {question ? question.prompt : guessRevealed ? "Final Guess" : "Press 'New Game' to start"}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: -2 }}>
            {question ? `attribute: ${question.key}` : "warning: may ask controversial questions like 'tabs or spaces?' purely for science."}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {loading ? (
              <div style={{ color: "#94a3b8" }}>Loading...</div>
            ) : (
              <>
                {!session && <button style={button(true)} onClick={newGame}>New Game</button>}
                {session && !question && !guessRevealed && (
                  <>
                    <button style={button(true)} onClick={() => revealGuess()}>Reveal Guess</button>
                    <button style={button()} onClick={() => nextQuestion()}>Keep Asking</button>
                  </>
                )}
                {session && !question && guessRevealed && (
                  <button style={button(true)} onClick={newGame}>New Game</button>
                )}
                {question && ["ui", "db", "realtime"].includes(question.key) && (
                  <>
                    <button style={button(true)} onClick={() => submitAnswer("yes")}>yes ✅</button>
                    <button style={button()} onClick={() => submitAnswer("no")}>no ❌</button>
                    <button style={button()} onClick={() => submitAnswer("unknown")}>unknown 🤷</button>
                  </>
                )}
                {question && !["ui", "db", "realtime"].includes(question.key) && (
                  <>
                    {[...new Set(question.options)].slice(0, 8).map((v, i) => (
                      <button 
                        key={i} 
                        style={button(i === 0)} 
                        onClick={() => submitAnswer(v)}
                      >
                        {v.replace("__MISSING__", "unknown")}
                      </button>
                    ))}
                    <button style={button()} onClick={() => submitAnswer("unknown")}>I refuse 🧪</button>
                  </>
                )}
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <span style={badge()}>candidates left: {remaining}</span>
          </div>
          <div style={{ marginTop: 8, color: "#a5b4fc", fontSize: 13 }}>{zinger}</div>
          
          {celebration && guessRevealed && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <img 
                src={celebration} 
                alt="Celebration" 
                style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} 
              />
            </div>
          )}
        </div>

        <div style={card()}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Transcript</div>
          <div
            ref={logRef}
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
              whiteSpace: "pre-wrap",
              background: "#0b1017",
              border: "1px dashed #1b2940",
              borderRadius: 12,
              padding: 12,
              height: 220,
              overflow: "auto",
            }}
          />
          <div style={{ marginTop: 8, color: "#8aa1bd", fontSize: 12 }}>
            pro tip: when in doubt, answer "unknown." it's what PMs do in standup.
          </div>
        </div>
      </div>

      <div>
        <div style={card()}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>My Guess</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#d9f99d" }}>{guess?.name ?? "—"}</div>
          <div style={{ color: "#93a5bf", marginTop: 6 }}>
            {guess ? (
              <>
                <span style={badge()}>type: {guess.type}</span>{" "}
                <span style={badge()}>domain: {guess.domain}</span>{" "}
                <span style={badge()}>lang: {guess.language}</span>
              </>
            ) : (
              "I'll start judging soon…"
            )}
          </div>
          <div style={{ marginTop: 10 }}>
            <button style={button()} onClick={forceGuess} disabled={loading || !session}>
              I'm done, guess now
            </button>
            <button 
              style={button(true)} 
              onClick={tweet} 
              disabled={!guess}
            >
              Tweet the chaos
            </button>
          </div>
        </div>

        <div style={card()}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Meme Settings</div>
          <div>
            <button 
              style={{...button(), background: tone === "gentle" ? "#223612" : "#192537"}} 
              onClick={() => setTone("gentle")}
            >
              😇 Gentle
            </button>
            <button 
              style={{...button(), background: tone === "snark" ? "#223612" : "#192537"}} 
              onClick={() => setTone("snark")}
            >
              😏 Snark
            </button>
            <button 
              style={{...button(), background: tone === "unhinged" ? "#223612" : "#192537"}} 
              onClick={() => setTone("unhinged")}
            >
              🤪 Unhinged
            </button>
          </div>
          <div style={{ color: "#94a3b8", fontSize: 13 }}>changes the tone of zingers + micro‑roasts.</div>
        </div>
      </div>
    </div>
  );
}
