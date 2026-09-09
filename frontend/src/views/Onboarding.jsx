import { useEffect, useState } from "react";
import { api } from "../api.js";
import Cover from "../components/Cover.jsx";
import { GENRES, GENRE_COLORS, faint, green, ink, mono, paper, serif } from "../theme.js";

/** Two-step cold start: pick genres, then tap books you've loved (seeded as 5★ reads). */
export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(1);
  const [genres, setGenres] = useState([]);
  const [seeds, setSeeds] = useState([]);       // candidate books for step 2
  const [loved, setLoved] = useState(new Set());

  useEffect(() => {
    if (step !== 2) return;
    Promise.all(genres.slice(0, 3).map((g) => api.listBooks({ genre: g, limit: 6 })))
      .then((lists) => setSeeds(lists.flat()));
  }, [step, genres]);

  const finish = async () => {
    await api.setPreferences(genres);
    await Promise.all([...loved].map((id) => api.updateShelf(id, { status: "read", rating: 5 })));
    onDone();
  };

  if (step === 1)
    return (
      <div style={{ maxWidth: 640, margin: "8vh auto 0", padding: 20 }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: green, letterSpacing: "0.1em" }}>SPINEWARD · STEP 1 OF 2</div>
        <h1 style={{ fontFamily: serif, fontSize: 44, margin: "10px 0 6px", lineHeight: 1.05, fontWeight: 400 }}>What do you reach for?</h1>
        <p style={{ color: faint, fontSize: 14, marginBottom: 26 }}>Pick two or more genres. Every recommendation will show its reasoning — the colored spine is the genre.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {GENRES.map((g) => {
            const on = genres.includes(g);
            return (
              <button key={g} onClick={() => setGenres((p) => (on ? p.filter((x) => x !== g) : [...p, g]))}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 14, cursor: "pointer",
                         border: `1px solid ${on ? ink : ink + "35"}`, background: on ? "#fff" : "transparent",
                         boxShadow: on ? "3px 3px 0 rgba(25,26,30,0.15)" : "none" }}>
                <span style={{ width: 8, height: 22, background: GENRE_COLORS[g], display: "inline-block" }} />{g}
              </button>
            );
          })}
        </div>
        <button disabled={genres.length < 2} onClick={() => setStep(2)}
          style={{ marginTop: 30, padding: "12px 26px", fontSize: 14, border: "none",
                   background: genres.length < 2 ? "#C9C8BF" : green, color: paper, cursor: genres.length < 2 ? "default" : "pointer" }}>
          Continue → pick books you've loved
        </button>
      </div>
    );

  return (
    <div style={{ maxWidth: 860, margin: "5vh auto 0", padding: 20 }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: green, letterSpacing: "0.1em" }}>SPINEWARD · STEP 2 OF 2</div>
      <h1 style={{ fontFamily: serif, fontSize: 40, margin: "10px 0 6px", lineHeight: 1.05, fontWeight: 400 }}>Which of these have you loved?</h1>
      <p style={{ color: faint, fontSize: 14, marginBottom: 24 }}>Tap any you've read and enjoyed — they seed your first recommendations. Skip if none apply.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {seeds.map((b) => {
          const on = loved.has(b.id);
          return (
            <button key={b.id}
              onClick={() => setLoved((s) => { const n = new Set(s); on ? n.delete(b.id) : n.add(b.id); return n; })}
              style={{ border: "none", background: "none", padding: 0, cursor: "pointer", transform: on ? "translateY(-4px)" : "none", transition: "transform .12s" }}>
              <div style={{ outline: on ? `2px solid ${green}` : "none", outlineOffset: 3 }}>
                <Cover book={b} w={118} h={172} />
              </div>
              <div style={{ fontFamily: mono, fontSize: 9, color: on ? green : "transparent", marginTop: 6 }}>loved ✓</div>
            </button>
          );
        })}
      </div>
      <button onClick={finish}
        style={{ marginTop: 28, padding: "12px 26px", fontSize: 14, background: green, color: paper, border: "none", cursor: "pointer" }}>
        Build my shelf →
      </button>
    </div>
  );
}
