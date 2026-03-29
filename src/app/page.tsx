"use client";

import { useEffect, useRef, useState } from "react";
import { PORTFOLIO_DATA } from "@/data/portfolio";

/* ─────────────────────────────────────────────────────────────
   Global terminal styles
───────────────────────────────────────────────────────────── */
const TERMINAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    height: 100%;
    background: #0a0a0a;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    overflow: hidden;
  }

  /* ── Blinking block cursor ── */
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .term-cursor::after {
    content: '█';
    animation: blink 1.1s step-start infinite;
    color: #00ff41;
    margin-left: 1px;
  }

  /* ── CRT scanlines ── */
  .crt-scanlines::after {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(0,0,0,0.18) 3px,
      rgba(0,0,0,0.18) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  /* ── Screen vignette ── */
  .crt-vignette::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at center,
      transparent 60%,
      rgba(0,0,0,0.55) 100%
    );
    pointer-events: none;
    z-index: 9998;
  }

  /* ── Phosphor glow ── */
  .glow-green  { text-shadow: 0 0 10px rgba(0,255,65,0.8),  0 0 3px rgba(0,255,65,0.5); }
  .glow-cyan   { text-shadow: 0 0 10px rgba(0,255,255,0.7), 0 0 3px rgba(0,255,255,0.4); }
  .glow-yellow { text-shadow: 0 0 10px rgba(255,220,0,0.7), 0 0 3px rgba(255,220,0,0.4); }
  .glow-red    { text-shadow: 0 0 10px rgba(255,80,80,0.7),  0 0 3px rgba(255,80,80,0.4); }

  /* ── Scrollbar ── */
  .term-scroll { scroll-behavior: smooth; }
  .term-scroll::-webkit-scrollbar { width: 5px; }
  .term-scroll::-webkit-scrollbar-track { background: #050f05; }
  .term-scroll::-webkit-scrollbar-thumb { background: #00ff4120; }
  .term-scroll::-webkit-scrollbar-thumb:hover { background: #00ff4145; }

  /* ── Input ── */
  .term-input:focus { outline: none; }
  .term-input::selection { background: #00ff4133; }

  /* ── Entry animation – like text printing to screen ── */
  @keyframes termPrint {
    from { opacity: 0; clip-path: inset(0 100% 0 0); }
    to   { opacity: 1; clip-path: inset(0 0% 0 0); }
  }
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(3px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .term-entry { animation: fadeDown 0.12s ease-out forwards; }
  .term-line  { animation: termPrint 0.18s steps(30, end) forwards; }

  /* ── Startup slide-in ── */
  @keyframes slideReveal {
    from { opacity: 0; max-height: 0; overflow: hidden; }
    to   { opacity: 1; max-height: 500px; }
  }
  .startup-line { animation: slideReveal 0.25s ease-out forwards; }

  /* ── Title bar button hover ── */
  .tb-btn:hover { filter: brightness(1.3); transform: scale(1.15); cursor: pointer; }
  .tb-btn { transition: filter 0.1s, transform 0.1s; }

  /* ── Command badge hover ── */
  .cmd-badge {
    color: #00ffff;
    border: 1px solid #00ffff33;
    padding: 2px 8px;
    font-size: 0.72rem;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, text-shadow 0.15s;
    display: inline-block;
  }
  .cmd-badge:hover {
    background: #00ffff11;
    border-color: #00ffff88;
    text-shadow: 0 0 8px rgba(0,255,255,0.8);
  }

  /* ── Link ── */
  .term-link {
    color: #00ffff;
    text-decoration: none;
    border-bottom: 1px solid #00ffff33;
    transition: border-color 0.15s, text-shadow 0.15s;
  }
  .term-link:hover {
    border-color: #00ffff;
    text-shadow: 0 0 8px rgba(0,255,255,0.8);
  }

  /* ── Status blip ── */
  @keyframes statusBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .status-dot { animation: statusBlink 2s ease-in-out infinite; }

  /* ── Matrix rain bg (subtle) ── */
  @keyframes matrixFall {
    0%   { transform: translateY(-100%); opacity: 0.6; }
    80%  { opacity: 0.3; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  /* ── Noise texture overlay ── */
  .noise-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9997;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 128px;
  }
`;

/* ─────────────────────────────────────────────────────────────
   BOX drawing chars
───────────────────────────────────────────────────────────── */
const BOX = {
  tl:"╔", tr:"╗", bl:"╚", br:"╝", h:"═", v:"║",
  ml:"╠", mr:"╣",
  ltl:"┌", ltr:"┐", lbl:"└", lbr:"┘", lh:"─", lv:"│",
  lml:"├", lmr:"┤",
  dtl:"╒", dtr:"╕", dbl:"╘", dbr:"╛", dh:"═", dv:"│",
};

/* Wide box helpers */
const W = 62; // inner width
function hTop(title?: string) {
  if (!title) return BOX.tl + BOX.h.repeat(W) + BOX.tr;
  const label = `[ ${title} ]`;
  const left = Math.floor((W - label.length) / 2);
  const right = W - label.length - left;
  return BOX.tl + BOX.h.repeat(left) + label + BOX.h.repeat(right) + BOX.tr;
}
function hBot()  { return BOX.bl + BOX.h.repeat(W) + BOX.br; }
function hDiv(label?: string) {
  if (!label) return BOX.ml + BOX.h.repeat(W) + BOX.mr;
  const tag = ` ${label} `;
  return BOX.ml + BOX.h.repeat(2) + tag + BOX.h.repeat(W - 2 - tag.length) + BOX.mr;
}
function hRow(txt: string) {
  return BOX.v + " " + txt.padEnd(W - 1) + BOX.v;
}

/* Light box */
function lTop(title?: string) {
  if (!title) return BOX.ltl + BOX.lh.repeat(W) + BOX.ltr;
  const label = `─ ${title} `;
  return BOX.ltl + label + BOX.lh.repeat(W - label.length) + BOX.ltr;
}
function lBot()  { return BOX.lbl + BOX.lh.repeat(W) + BOX.lbr; }
function lDiv()  { return BOX.lml + BOX.lh.repeat(W) + BOX.lmr; }

/* ─────────────────────────────────────────────────────────────
   Mini atoms
───────────────────────────────────────────────────────────── */
function TermLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer" className="term-link">{children}</a>;
}

function ProgressBar({ value, max, color = "#00ff41", width = 24 }: { value: number; max: number; color?: string; width?: number }) {
  const filled = Math.round((value / max) * width);
  return (
    <span style={{ color, fontFamily: "monospace", letterSpacing: 0 }}>
      {"▐"}{"█".repeat(filled)}{"░".repeat(width - filled)}{"▌"}
      <span style={{ color: "#88cc88", marginLeft: "6px" }}>{value}/{max}</span>
    </span>
  );
}

function Tag({ children, color = "#00ffff" }: { children: React.ReactNode; color?: string }) {
  return <span style={{ color, border: `1px solid ${color}44`, padding: "1px 7px", fontSize: "0.72rem", display: "inline-block" }}>{children}</span>;
}

/* ─────────────────────────────────────────────────────────────
   Decorative ASCII patterns
───────────────────────────────────────────────────────────── */
// Deterministic — safe for SSR (no Math.random)
const _MC = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ░▒▓";
const _MS = Array.from({ length: 64 }, (_, i) => _MC[(i * 7 + 13) % _MC.length]).join("");

function MatrixStrip({ color = "#00ff4115" }: { color?: string }) {
  return (
    <div style={{ color, fontSize: "0.6rem", letterSpacing: "0.05em", overflow: "hidden", whiteSpace: "nowrap", userSelect: "none", lineHeight: 1.2 }}>
      {_MS}
    </div>
  );
}

function DotGrid({ rows = 3, cols = 64, color = "#00ff4110" }: { rows?: number; cols?: number; color?: string }) {
  return (
    <div style={{ color, fontSize: "0.55rem", lineHeight: 1.6, letterSpacing: "0.18em", userSelect: "none" }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r}>{Array.from({ length: cols }, (_, c) => ((r + c) % 3 === 0 ? "·" : (r + c) % 7 === 0 ? "+" : "·")).join("")}</div>
      ))}
    </div>
  );
}

function HexPattern({ color = "#00ff4112" }: { color?: string }) {
  const row1 = "⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡";
  const row2 = " ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡";
  return (
    <div style={{ color, fontSize: "0.5rem", lineHeight: 1.8, userSelect: "none", overflow: "hidden" }}>
      <div>{row1}</div>
      <div>{row2}</div>
      <div>{row1}</div>
    </div>
  );
}

function SectionDecor({ label }: { label: string }) {
  return (
    <div style={{ color: "#00ff4133", fontSize: "0.68rem", marginBottom: "6px", userSelect: "none" }}>
      <span>{"╟" + "─".repeat(3)}</span>
      <span style={{ color: "#00ff4166", margin: "0 4px" }}>{"{ " + label + " }"}</span>
      <span>{"─".repeat(3) + "╢"}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ABOUT CARD
───────────────────────────────────────────────────────────── */
function AboutCard() {
  const about = PORTFOLIO_DATA.about;
  return (
    <div className="term-entry" style={{ color: "#00ff41", fontSize: "0.8rem" }}>
      <HexPattern />
      <div style={{ whiteSpace: "pre", lineHeight: 1.5 }}>
        {hTop("WHOAMI --FULL")}
      </div>
      <MatrixStrip />

      {/* Photo + info */}
      <div style={{ display: "flex", gap: "16px", padding: "10px 0 4px" }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ border: "1px solid #00ff4144", padding: "3px", position: "relative" }}>
            <div style={{ position: "absolute", top: -1, left: -1, right: -1, bottom: -1, boxShadow: "inset 0 0 16px rgba(0,255,65,0.12)", pointerEvents: "none" }} />
            <img
              src={about.photo} alt={about.name}
              style={{ width: "130px", height: "155px", objectFit: "cover", display: "block", filter: "contrast(1.1) saturate(0.85) brightness(0.95)" }}
            />
          </div>
          <div style={{ color: "#00ff4133", fontSize: "0.58rem", textAlign: "center", marginTop: "3px", letterSpacing: "0.08em" }}>
            ░▒▓ profile.jpg ▓▒░
          </div>
        </div>

        <div style={{ flex: 1, lineHeight: 2, fontSize: "0.79rem" }}>
          {[
            ["USER", about.name,               "#e0ffe0"],
            ["ROLE", about.title,               "#00ffff"],
            ["DEG ",  about.education.degree,    "#e0ffe0"],
            ["INST",  about.education.college,   "#e0ffe0"],
            ["YEAR",  about.education.year,      "#88cc88"],
          ].map(([lbl, val, col]) => (
            <div key={lbl} style={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#00ff4199", minWidth: "38px" }}>{lbl}</span>
              <span style={{ color: "#00ff4144" }}>│</span>
              <span style={{ color: col as string }}>{val}</span>
            </div>
          ))}
          <div style={{ color: "#00ff4133", margin: "2px 0" }}>{BOX.lml + BOX.lh.repeat(40) + BOX.lmr}</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ color: "#00ff4199", minWidth: "38px" }}>LEET</span>
            <span style={{ color: "#00ff4144" }}>│</span>
            <span style={{ color: "#ffdd00" }}>{about.leetcode.badge}</span>
            <Tag color="#ffdd00">{about.leetcode.solved} solved</Tag>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <span style={{ color: "#00ff4199", minWidth: "38px" }}>HOBB</span>
            <span style={{ color: "#00ff4144" }}>│</span>
            <span style={{ color: "#88ff88" }}>{about.hobbies.join("  ·  ")}</span>
          </div>
        </div>
      </div>

      {/* Intro */}
      <div style={{ whiteSpace: "pre", color: "#00ff4155" }}>{hDiv("INTRO")}</div>
      <div style={{ color: "#00ff4133", fontSize: "0.62rem" }}>{Array.from({ length: 3 }, (_, i) => <MatrixStrip key={i} color="#00ff4108" />)}</div>
      <div style={{
        color: "#aaffaa", fontSize: "0.79rem", lineHeight: 1.85,
        padding: "8px 10px",
        borderLeft: "3px solid #00ff4133",
        marginLeft: "4px",
        background: "linear-gradient(90deg, #00ff410a 0%, transparent 100%)",
      }}>
        {about.intro}
      </div>

      {/* Links */}
      <div style={{ whiteSpace: "pre", color: "#00ff4155", margin: "6px 0 2px" }}>{hDiv("LINKS")}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "6px 4px 10px" }}>
        {[
          { label: "◈ GITHUB",    href: about.socials.github,              color: "#00ffff" },
          { label: "◈ LINKEDIN",  href: about.socials.linkedin,            color: "#00ffff" },
          { label: "◈ INSTAGRAM", href: about.socials.instagram,           color: "#00ffff" },
          { label: "◈ EMAIL",     href: `mailto:${about.socials.email}`,   color: "#00ffff" },
          { label: "◈ LEETCODE",  href: about.leetcode.profile,            color: "#ffdd00" },
          { label: "◈ RESUME",    href: about.resume,                      color: "#00ff41" },
        ].map(({ label, href, color }) => (
          <TermLink key={label} href={href}>
            <span style={{ color, fontSize: "0.75rem" }}>{label}</span>
          </TermLink>
        ))}
      </div>

      {/* Resume embed */}
      <div style={{ color: "#00ff4144", fontSize: "0.68rem", marginBottom: "4px" }}>
        {BOX.ltl + BOX.lh.repeat(2)} resume.pdf {BOX.lh.repeat(W - 13)}{BOX.ltr}
      </div>
      <div style={{ border: "1px solid #00ff4120" }}>
        <iframe src={about.resume} title="Resume PDF"
          style={{ width: "100%", height: "480px", background: "#000", display: "block" }} />
      </div>

      <div style={{ color: "#00ff4155", marginTop: "6px" }}>
        <MatrixStrip />
        <div style={{ whiteSpace: "pre" }}>{hBot()}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EXPERIENCE CARD
───────────────────────────────────────────────────────────── */
function ExperienceCard() {
  const { internships, pors } = PORTFOLIO_DATA.experiences;

  const renderItem = (item: { title: string; organization: string; duration: string; description: string }, index: number) => (
    <div key={index} className="term-entry" style={{ marginBottom: "14px", paddingLeft: "4px" }}>
      {/* Item header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
        <span style={{ color: "#00ff4155", fontSize: "0.7rem" }}>[{String(index + 1).padStart(2, "0")}]</span>
        <span style={{ color: "#00ffff", fontWeight: 600, fontSize: "0.84rem" }}
          className="glow-cyan">{item.title}</span>
      </div>
      <div style={{ paddingLeft: "30px", borderLeft: "2px solid #00ff4120", marginLeft: "12px" }}>
        <div style={{ fontSize: "0.77rem", lineHeight: 1.9 }}>
          <span style={{ color: "#00ff4177" }}>org  </span>
          <span style={{ color: "#00ff4133" }}>│ </span>
          <span style={{ color: "#88dddd" }}>{item.organization}</span>
        </div>
        <div style={{ fontSize: "0.77rem", lineHeight: 1.6 }}>
          <span style={{ color: "#00ff4177" }}>date </span>
          <span style={{ color: "#00ff4133" }}>│ </span>
          <span style={{ color: "#777" }}>{item.duration}</span>
        </div>
        <div style={{
          color: "#99cc99", fontSize: "0.77rem", lineHeight: 1.75,
          marginTop: "6px",
          padding: "6px 10px",
          background: "#00ff4108",
          whiteSpace: "pre-wrap",
        }}>
          {item.description}
        </div>
      </div>
    </div>
  );

  return (
    <div className="term-entry" style={{ color: "#00ff41", fontSize: "0.8rem" }}>
      <DotGrid rows={2} cols={64} />
      <div style={{ whiteSpace: "pre" }}>{hTop("cat experience.log")}</div>
      <MatrixStrip color="#00ff4110" />

      <div style={{ padding: "8px 4px 4px" }}>
        <SectionDecor label={`INTERNSHIPS & WORK  (${internships.length} entries)`} />
        {internships.map(renderItem)}
      </div>

      <div style={{ whiteSpace: "pre", color: "#00ff4155" }}>{hDiv()}</div>

      <div style={{ padding: "8px 4px 4px" }}>
        <SectionDecor label={`POSITIONS OF RESPONSIBILITY  (${pors.length} entries)`} />
        {pors.map(renderItem)}
      </div>

      <MatrixStrip color="#00ff4110" />
      <div style={{ whiteSpace: "pre" }}>{hBot()}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROJECTS CARD
───────────────────────────────────────────────────────────── */
function ProjectsCard() {
  const projects = PORTFOLIO_DATA.projects;
  return (
    <div className="term-entry" style={{ color: "#00ff41", fontSize: "0.8rem" }}>
      <HexPattern />
      <div style={{ whiteSpace: "pre" }}>{hTop("ls -la ~/projects/")}</div>
      <MatrixStrip color="#00ff4112" />

      <div style={{ padding: "6px 0" }}>
        {projects.map((p, i) => (
          <div key={i} className="term-entry" style={{ marginBottom: "20px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "6px" }}>
              <span style={{ color: "#00ff4166", fontSize: "0.72rem" }}>{String(i + 1).padStart(2, "0")}.</span>
              <span className="glow-cyan" style={{ color: "#00ffff", fontWeight: 700, fontSize: "0.9rem" }}>{p.title}</span>
            </div>

            {/* Image frame */}
            <div style={{ marginBottom: "8px" }}>
              <div style={{
                color: "#00ff4133", fontSize: "0.62rem", padding: "2px 8px",
                background: "#001200",
                borderTop: "1px solid #00ff4122",
                borderLeft: "1px solid #00ff4122",
                borderRight: "1px solid #00ff4122",
                display: "flex", justifyContent: "space-between",
              }}>
                <span>░▒ {p.title.toLowerCase().replace(/ /g, "_")}.png</span>
                <span style={{ color: "#00ff4155" }}>▒░</span>
              </div>
              <div style={{ position: "relative", border: "1px solid #00ff4120" }}>
                <img src={p.image} alt={p.title}
                  style={{ width: "100%", height: "185px", objectFit: "cover", display: "block", filter: "saturate(0.8) contrast(1.08)" }} />
                {/* Corner decorations */}
                {["tl","tr","bl","br"].map(c => (
                  <div key={c} style={{
                    position: "absolute",
                    top: c.startsWith("t") ? 0 : "auto",
                    bottom: c.startsWith("b") ? 0 : "auto",
                    left: c.endsWith("l") ? 0 : "auto",
                    right: c.endsWith("r") ? 0 : "auto",
                    width: 16, height: 16,
                    borderTop: c.startsWith("t") ? "2px solid #00ff41" : "none",
                    borderBottom: c.startsWith("b") ? "2px solid #00ff41" : "none",
                    borderLeft: c.endsWith("l") ? "2px solid #00ff41" : "none",
                    borderRight: c.endsWith("r") ? "2px solid #00ff41" : "none",
                  }} />
                ))}
              </div>
            </div>

            <div style={{ paddingLeft: "4px", fontSize: "0.78rem" }}>
              <div style={{
                color: "#99cc99", lineHeight: 1.8, borderLeft: "3px solid #00ff4130",
                paddingLeft: "10px", marginBottom: "8px",
                background: "linear-gradient(90deg, #00ff4106, transparent)",
              }}>
                {p.description}
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <TermLink href={p.github}><span style={{ color: "#00ffff" }}>[ github ↗ ]</span></TermLink>
                <TermLink href={p.demo}><span style={{ color: "#00ff41" }}>[ live-demo ↗ ]</span></TermLink>
              </div>
            </div>

            {i < projects.length - 1 && (
              <div style={{ color: "#00ff4118", marginTop: "14px", fontSize: "0.7rem" }}>
                {"·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─·─"}
              </div>
            )}
          </div>
        ))}
      </div>

      <MatrixStrip color="#00ff4110" />
      <div style={{ whiteSpace: "pre" }}>{hBot()}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACHIEVEMENTS CARD
───────────────────────────────────────────────────────────── */
function AchievementsCard() {
  const achievements = PORTFOLIO_DATA.achievements;
  return (
    <div className="term-entry" style={{ color: "#00ff41", fontSize: "0.8rem" }}>
      <DotGrid rows={2} cols={64} color="#00ff4112" />
      <div style={{ whiteSpace: "pre" }}>{hTop("cat achievements.txt")}</div>
      <MatrixStrip color="#00ff4112" />

      <div style={{ padding: "8px 4px" }}>
        {achievements.map((a, i) => (
          <div key={i} className="term-entry" style={{
            display: "flex", alignItems: "flex-start", gap: "12px",
            marginBottom: "10px", fontSize: "0.79rem",
            borderLeft: "2px solid #00ff4120",
            paddingLeft: "12px",
            paddingTop: "4px", paddingBottom: "4px",
          }}>
            <span className="glow-yellow" style={{ color: "#ffdd00", flexShrink: 0, fontSize: "1rem" }}>★</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e0ffe0", fontWeight: 600, lineHeight: 1.5 }}>{a.title}</div>
              <div style={{ color: "#66aaaa", fontSize: "0.74rem" }}>{a.subtitle}</div>
            </div>
            <TermLink href={a.proof}>
              <span style={{ color: "#00ff4177", fontSize: "0.7rem" }}>
                {a.proof.endsWith(".pdf") ? "[ cert.pdf ↗ ]" : "[ proof ↗ ]"}
              </span>
            </TermLink>
          </div>
        ))}
      </div>

      <MatrixStrip color="#00ff4110" />
      <div style={{ whiteSpace: "pre" }}>{hBot()}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SOCIALS CARD
───────────────────────────────────────────────────────────── */
function SocialsCard() {
  const { socials, leetcode, resume, name } = PORTFOLIO_DATA.about;
  const items = [
    { label: "GITHUB   ", href: socials.github,              url: socials.github,              color: "#00ffff", icon: "◈" },
    { label: "LINKEDIN ", href: socials.linkedin,            url: socials.linkedin,            color: "#00ffff", icon: "◈" },
    { label: "INSTAGRAM", href: socials.instagram,           url: socials.instagram,           color: "#00ffff", icon: "◈" },
    { label: "EMAIL    ", href: `mailto:${socials.email}`,   url: socials.email,               color: "#00ffff", icon: "✉" },
    { label: "LEETCODE ", href: leetcode.profile,            url: leetcode.profile,            color: "#ffdd00", icon: "◈" },
    { label: "RESUME   ", href: resume,                      url: `${name} — Resume.pdf`,     color: "#00ff41", icon: "◈" },
  ];

  return (
    <div className="term-entry" style={{ color: "#00ff41", fontSize: "0.8rem" }}>
      <HexPattern />
      <div style={{ whiteSpace: "pre" }}>{hTop("cat /etc/contacts")}</div>
      <MatrixStrip color="#00ff4112" />

      <div style={{ padding: "10px 4px" }}>
        {items.map(({ label, href, url, color, icon }) => (
          <div key={label} style={{
            display: "flex", gap: "10px", marginBottom: "10px",
            alignItems: "center", lineHeight: 1.7,
            borderBottom: "1px solid #00ff4110",
            paddingBottom: "8px",
          }}>
            <span style={{ color: "#00ff4155" }}>{BOX.lv}</span>
            <span style={{ color: "#ffdd00", fontSize: "0.75rem" }}>{icon}</span>
            <span style={{ color: "#00ff41aa", minWidth: "76px", fontSize: "0.77rem" }}>{label}</span>
            <span style={{ color: "#00ff4133" }}>│</span>
            <TermLink href={href}><span style={{ color }}>{url}</span></TermLink>
          </div>
        ))}
      </div>

      <MatrixStrip color="#00ff4110" />
      <div style={{ whiteSpace: "pre" }}>{hBot()}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ASCII Art Banner
───────────────────────────────────────────────────────────── */
function Banner() {
  return (
    <div className="glow-green"
      style={{ color: "#00ff41", whiteSpace: "pre", fontSize: "clamp(0.32rem, 1.1vw, 0.68rem)", lineHeight: 1.25, userSelect: "none", marginBottom: "2px" }}>
{`  ██████╗      ██╗ █████╗ ███████╗██╗   ██╗
 ██╔═══██╗     ██║██╔══██╗██╔════╝██║   ██║
 ██║   ██║     ██║███████║███████╗██║   ██║
 ██║   ██║██   ██║██╔══██║╚════██║╚██╗ ██╔╝
 ╚██████╔╝╚█████╔╝██║  ██║███████║ ╚████╔╝ 
  ╚═════╝  ╚════╝ ╚═╝  ╚═╝╚══════╝  ╚═══╝  `}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   History entry
───────────────────────────────────────────────────────────── */
type HistoryItem = {
  type: "bot" | "user" | "component";
  text?: string;
  component?: React.ReactNode;
};

function HistoryEntry({ item, index, typingIndex, typedText }: {
  item: HistoryItem;
  index: number;
  typingIndex: number | null;
  typedText: string;
}) {
  if (item.type === "component") {
    return <div className="term-entry" style={{ marginTop: "6px" }}>{item.component}</div>;
  }
  if (item.type === "user") {
    return (
      <div className="term-entry" style={{
        display: "flex", gap: "8px", fontSize: "0.82rem", lineHeight: 1.7,
        marginTop: "10px",
        paddingTop: "6px",
        borderTop: "1px solid #00ff4115",
      }}>
        <span className="glow-cyan" style={{ color: "#00ffff", flexShrink: 0 }}>visitor@portfolio:~$</span>
        <span style={{ color: "#e0ffe0" }}>{item.text?.replace("visitor@portfolio:~$ ", "")}</span>
      </div>
    );
  }

  const isTyping = typingIndex === index;
  const text = isTyping ? typedText : (item.text ?? "");

  return (
    <div className="term-entry" style={{
      display: "flex", gap: "8px", color: "#00ff41", fontSize: "0.82rem",
      lineHeight: 1.8, marginTop: "3px",
    }}>
      <span style={{ color: "#00ff4150", flexShrink: 0 }}>▸</span>
      <div style={{ whiteSpace: "pre-wrap", flex: 1, color: "#b0ffb0" }}>
        {text}{isTyping && <span className="term-cursor" />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Startup entries
───────────────────────────────────────────────────────────── */
function StartupEntry({ item, index }: { item: HistoryItem; index: number }) {
  if (index === 0) {
    return (
      <div className="startup-line" style={{ marginBottom: "4px" }}>
        <DotGrid rows={2} cols={66} color="#00ff4115" />
        <Banner />
        <div style={{ color: "#00ff4133", fontSize: "0.6rem", userSelect: "none", marginBottom: "2px" }}>
          {"░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"}
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="startup-line" style={{ color: "#00ffff", fontSize: "0.79rem", marginBottom: "6px" }}>
        <span className="glow-cyan">{item.text}</span>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="startup-line" style={{ marginBottom: "8px" }}>
        <div style={{ border: "1px solid #00ff4125", padding: "8px 12px", fontSize: "0.75rem", color: "#88ff88", background: "#001500" }}>
          <div style={{ color: "#00ff4155", marginBottom: "4px", fontSize: "0.68rem" }}>
            {BOX.ltl + BOX.lh.repeat(2)} AVAILABLE COMMANDS {BOX.lh.repeat(38)}{BOX.ltr}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "2px 0" }}>
            {["whoami", "about", "experience", "projects", "achievements", "socials", "clear", "help"].map(cmd => (
              <span key={cmd} className="cmd-badge"
                onClick={() => {
                  const ev = new CustomEvent("terminal-cmd", { detail: cmd });
                  window.dispatchEvent(ev);
                }}>
                {cmd}
              </span>
            ))}
          </div>
          <div style={{ color: "#00ff4533", fontSize: "0.68rem", marginTop: "4px" }}>
            {BOX.lbl + BOX.lh.repeat(58)}{BOX.lbr}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="startup-line" style={{ color: "#00ff4166", fontSize: "0.74rem", marginBottom: "3px" }}>
      {item.text}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TITLE BAR  — full macOS-style terminal chrome
───────────────────────────────────────────────────────────── */
function TitleBar({ cmdCount }: { cmdCount: number }) {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = time ? String(time.getHours()).padStart(2, "0") : "--";
  const mm = time ? String(time.getMinutes()).padStart(2, "0") : "--";
  const ss = time ? String(time.getSeconds()).padStart(2, "0") : "--";

  return (
    <div style={{
      flexShrink: 0,
      background: "linear-gradient(180deg, #1a2a1a 0%, #0f1f0f 100%)",
      borderBottom: "1px solid #00ff4130",
    }}>
      {/* Traffic light row */}
      <div style={{
        padding: "8px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Buttons */}
        <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
          {[
            { bg: "#ff5f57", shadow: "#ff5f57" },
            { bg: "#febc2e", shadow: "#febc2e" },
            { bg: "#28c840", shadow: "#28c840" },
          ].map((b, i) => (
            <div key={i} className="tb-btn" style={{
              width: "11px", height: "11px", borderRadius: "50%",
              background: b.bg,
              boxShadow: `0 0 5px ${b.shadow}99`,
            }} />
          ))}
          <span style={{ color: "#00ff4133", fontSize: "0.65rem", marginLeft: "6px" }}>
            {BOX.lv} terminal — bash
          </span>
        </div>

        {/* Center title */}
        <div className="glow-green" style={{ color: "#00ff41", fontSize: "0.71rem", letterSpacing: "0.12em", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          terminal-portfolio — 220×50
        </div>

        {/* Right meta */}
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <span className="status-dot" style={{ color: "#00ff41", fontSize: "0.65rem" }}>● ONLINE</span>
          <span className="glow-cyan" style={{ color: "#00ffff88", fontSize: "0.65rem", fontVariantNumeric: "tabular-nums" }}>
            {hh}:{mm}:{ss}
          </span>
        </div>
      </div>

      {/* Sub-bar: breadcrumb + stats */}
      <div style={{
        padding: "3px 14px",
        background: "#050f05",
        borderTop: "1px solid #00ff4118",
        fontSize: "0.65rem",
        color: "#00ff4155",
        display: "flex", gap: "0",
      }}>
        {[
          ["uptime", "∞"],
          ["shell", "bash 5.2"],
          ["user", "visitor"],
          ["pwd", "~/portfolio"],
          ["cmds", String(cmdCount)],
        ].map(([k, v], i) => (
          <span key={k} style={{
            padding: "0 12px",
            borderRight: "1px solid #00ff4118",
          }}>
            <span style={{ color: "#00ff4133" }}>{k}</span>
            <span style={{ color: "#00ff4111" }}>:</span>
            <span style={{ color: "#00ff4188", marginLeft: "4px" }}>{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN TERMINAL
───────────────────────────────────────────────────────────── */
export default function Home() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [typedText, setTypedText] = useState("");
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const [cmdCount, setCmdCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Startup
  useEffect(() => {
    setHistory([
      { type: "bot", text: "OJASV // TERMINAL PORTFOLIO" },
      { type: "bot", text: "Welcome to my interactive terminal portfolio." },
      { type: "bot", text: "Commands: whoami | about | experience | projects | achievements | socials" },
      { type: "bot", text: 'Type "help" to see all commands or click any badge above.' },
    ]);
  }, []);

  // Listen for cmd-badge clicks
  useEffect(() => {
    const handler = (e: Event) => {
      const cmd = (e as CustomEvent).detail as string;
      handleCommand(cmd);
    };
    window.addEventListener("terminal-cmd", handler);
    return () => window.removeEventListener("terminal-cmd", handler);
  });

  // Auto-scroll — instant jump like a real terminal
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, typedText]);

  // Typing effect
  useEffect(() => {
    if (typingIndex === null) return;
    const currentItem = history[typingIndex];
    if (!currentItem || currentItem.type !== "bot" || !currentItem.text) {
      setTypingIndex(null); setTypedText(""); return;
    }
    const fullText = currentItem.text;
    if (typedText.length >= fullText.length) { setTypingIndex(null); return; }
    const timer = setTimeout(() => setTypedText(fullText.slice(0, typedText.length + 1)), 10);
    return () => clearTimeout(timer);
  }, [typedText, typingIndex, history]);

  const pushCommandOutput = (command: string, item: HistoryItem) => {
    setHistory(prev => {
      const filtered = prev.filter(entry => {
        if (entry.type !== "component") return true;
        const isEl = (n: React.ReactNode): n is React.ReactElement =>
          typeof n === "object" && n !== null && "type" in n;
        if (!isEl(entry.component)) return true;
        if (command === "about"        && entry.component.type === AboutCard)        return false;
        if (command === "experience"   && entry.component.type === ExperienceCard)   return false;
        if (command === "projects"     && entry.component.type === ProjectsCard)     return false;
        if (command === "achievements" && entry.component.type === AchievementsCard) return false;
        if (command === "socials"      && entry.component.type === SocialsCard)      return false;
        return true;
      });
      return [
        ...filtered,
        { type: "user", text: `visitor@portfolio:~$ ${command}` },
        item,
      ];
    });
    setCmdCount(c => c + 1);
    if (item.type === "bot") {
      setTypedText(""); setTypingIndex(history.length + 1);
    } else {
      setTypedText(""); setTypingIndex(null);
    }
  };

  const handleCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === "clear") {
      setHistory([]); setTypedText(""); setTypingIndex(null); return;
    }
    if (cmd === "help") {
      pushCommandOutput(command, {
        type: "bot",
        text: [
          "┌─ COMMANDS ──────────────────────────────",
          "│  whoami        →  quick identity summary",
          "│  about         →  full profile + resume ",
          "│  experience    →  internships & PORs    ",
          "│  projects      →  portfolio work        ",
          "│  achievements  →  awards & certs        ",
          "│  socials       →  links & contacts      ",
          "│  clear         →  wipe terminal         ",
          "│  help          →  this message          ",
          "└─────────────────────────────────────────",
        ].join("\n"),
      });
      return;
    }
    if (cmd === "whoami") {
      pushCommandOutput(command, {
        type: "bot",
        text: [
          `Name       : ${PORTFOLIO_DATA.about.name}`,
          `Role       : ${PORTFOLIO_DATA.about.title}`,
          `Status     : Building, learning, creating`,
          `Education  : ${PORTFOLIO_DATA.about.education.year}`,
          `Speciality : Code + creativity + problem solving`,
        ].join("\n"),
      });
      return;
    }
    if (cmd === "about")        { pushCommandOutput(command, { type: "component", component: <AboutCard /> });        return; }
    if (cmd === "experience")   { pushCommandOutput(command, { type: "component", component: <ExperienceCard /> });   return; }
    if (cmd === "projects")     { pushCommandOutput(command, { type: "component", component: <ProjectsCard /> });     return; }
    if (cmd === "achievements") { pushCommandOutput(command, { type: "component", component: <AchievementsCard /> }); return; }
    if (cmd === "socials")      { pushCommandOutput(command, { type: "component", component: <SocialsCard /> });      return; }

    pushCommandOutput(command, {
      type: "bot",
      text: `bash: ${cmd}: command not found\nType 'help' for available commands.`,
    });
  };

  return (
    <>
      <style>{TERMINAL_STYLES}</style>

      {/* CRT overlay layers */}
      <div className="crt-scanlines crt-vignette noise-overlay" />

      {/* Ambient green phosphor glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 50% 30%, rgba(0,255,65,0.04) 0%, transparent 65%)",
      }} />

      <main
        style={{
          height: "100vh", overflow: "hidden",
          background: "#030d03",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color: "#00ff41",
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column",
          /* outer terminal window border */
          border: "1px solid #00ff4122",
          boxShadow: "0 0 40px rgba(0,255,65,0.08), inset 0 0 60px rgba(0,255,65,0.02)",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* ── Window chrome ── */}
        <TitleBar cmdCount={cmdCount} />

        {/* ── Scrollable output ── */}
        <div
          ref={scrollRef}
          className="term-scroll"
          style={{
            flex: 1, minHeight: 0, overflowY: "auto",
            padding: "12px 16px 6px",
            background: "linear-gradient(180deg, #010d01 0%, #030d03 100%)",
            /* subtle inner grid lines */
            backgroundImage: `
              linear-gradient(180deg, #010d01 0%, #030d03 100%),
              repeating-linear-gradient(0deg, transparent, transparent 23px, #00ff4106 23px, #00ff4106 24px)
            `,
            backgroundBlendMode: "normal",
            maxWidth: "960px",
            width: "100%",
            margin: "0 auto",
            alignSelf: "center",
          }}
        >
          {history.map((item, index) => {
            const isStartup = index <= 3 && item.type === "bot";
            return isStartup
              ? <StartupEntry key={index} item={item} index={index} />
              : <HistoryEntry key={index} item={item} index={index} typingIndex={typingIndex} typedText={typedText} />;
          })}

          {/* Auto-scroll anchor */}
          <div ref={bottomRef} style={{ height: "4px" }} />
        </div>

        {/* ── Input bar ── */}
        <div style={{
          flexShrink: 0,
          borderTop: "1px solid #00ff4130",
          background: "linear-gradient(180deg, #050f05 0%, #020a02 100%)",
          padding: "8px 16px 6px",
          maxWidth: "960px", width: "100%", margin: "0 auto", alignSelf: "center",
        }}>
          {/* Prompt row */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="glow-cyan" style={{ color: "#00ffff", fontSize: "0.82rem", flexShrink: 0 }}>
              visitor@portfolio:~$
            </span>
            <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
              <input
                ref={inputRef}
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { handleCommand(input); setInput(""); }
                }}
                className="term-input"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#e0ffe0",
                  fontSize: "0.82rem",
                  fontFamily: "inherit",
                  caretColor: "transparent",
                }}
                spellCheck={false}
                autoComplete="off"
              />
              {!input && <span className="term-cursor" />}
            </div>
          </div>

          {/* Hint bar */}
          <div style={{
            marginTop: "4px",
            fontSize: "0.6rem",
            color: "#00ff4125",
            display: "flex", gap: "18px",
            borderTop: "1px solid #00ff4110",
            paddingTop: "4px",
          }}>
            <span>⏎ execute</span>
            <span>help → all commands</span>
            <span>clear → reset</span>
            <span style={{ marginLeft: "auto", color: "#00ff4115" }}>
              {"░▒▓ TERMINAL v1.0 ▓▒░"}
            </span>
          </div>
        </div>

      </main>
    </>
  );
}
