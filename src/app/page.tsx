"use client";

import Game from "@/components/Game";

export default function Home() {
  return (
    <main style={{ maxWidth: 980, margin: "32px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: 0.3, display: "flex", gap: 12, alignItems: "center" }}>
        Devkinator <span style={chip()}>Roast Mode 🔥</span>
        <span style={chip()}>GLM‑4.5 ready</span>
      </h1>
      <p style={{ color: "#93a5bf", paddingBottom: 16 }}>
        Think of a dev thing (React / Redis / Docker / Binary Search…). I'll guess it in ≤20 Qs—and roast you lovingly.
      </p>
      <Game />
    </main>
  );
}

function chip(): React.CSSProperties {
  return {
    fontSize: 12, padding: "4px 8px", borderRadius: 999, background: "#1b2735",
    color: "#e2e8f0", border: "1px solid #28374a"
  };
}
