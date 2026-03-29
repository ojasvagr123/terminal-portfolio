"use client";

import { useEffect, useRef, useState } from "react";
import { PORTFOLIO_DATA } from "@/data/portfolio";

/* ─────────────────────────────────────────────────────────────
   Global terminal styles injected once
───────────────────────────────────────────────────────────── */
const TERMINAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  body {
    background: #000;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  }

  /* Blinking cursor */
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .term-cursor::after {
    content: '█';
    animation: blink 1s step-start infinite;
    color: #00ff41;
    font-size: 0.9em;
  }

  /* CRT scanlines overlay */
  .scanlines::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.12) 2px,
      rgba(0,0,0,0.12) 4px
    );
    pointer-events: none;
    z-index: 1;
  }

  /* CRT screen flicker */
  @keyframes flicker {
    0%, 97%, 100% { opacity: 1; }
    98% { opacity: 0.92; }
    99% { opacity: 0.97; }
  }
  .crt-flicker {
    animation: flicker 8s infinite;
  }

  /* phosphor glow on text */
  .glow-green { text-shadow: 0 0 8px rgba(0,255,65,0.7), 0 0 2px rgba(0,255,65,0.4); }
  .glow-cyan  { text-shadow: 0 0 8px rgba(0,255,255,0.6), 0 0 2px rgba(0,255,255,0.3); }
  .glow-yellow { text-shadow: 0 0 8px rgba(255,255,0,0.6), 0 0 2px rgba(255,255,0,0.3); }

  /* Terminal scrollbar */
  .term-scroll::-webkit-scrollbar { width: 6px; }
  .term-scroll::-webkit-scrollbar-track { background: #000; }
  .term-scroll::-webkit-scrollbar-thumb { background: #00ff4133; border-radius: 0; }
  .term-scroll::-webkit-scrollbar-thumb:hover { background: #00ff4166; }

  /* smooth auto-scroll */
  .term-scroll { scroll-behavior: smooth; }

  /* Input glow */
  .term-input:focus { outline: none; }

  /* Box drawing fade-in */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .term-entry { animation: fadeIn 0.15s ease-out; }

  /* Progress bar pulse */
  @keyframes barPulse {
    0%,100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* Startup typewriter lines */
  @keyframes slideIn {
    from { opacity: 0; max-height: 0; }
    to { opacity: 1; max-height: 200px; }
  }
  .startup-line {
    overflow: hidden;
    animation: slideIn 0.2s ease-out forwards;
  }
`;

/* ─────────────────────────────────────────────────────────────
   Helpers: ASCII box drawing
───────────────────────────────────────────────────────────── */
const BOX = {
  tl: "╔", tr: "╗", bl: "╚", br: "╝",
  h: "═", v: "║",
  ml: "╠", mr: "╣", mt: "╦", mb: "╩", cross: "╬",
  // light variants
  ltl: "┌", ltr: "┐", lbl: "└", lbr: "┘",
  lh: "─", lv: "│",
  lml: "├", lmr: "┤",
};

function boxTop(width: number, title?: string) {
  if (!title) return BOX.tl + BOX.h.repeat(width) + BOX.tr;
  const pad = Math.floor((width - title.length - 2) / 2);
  const rpad = width - title.length - 2 - pad;
  return BOX.tl + BOX.h.repeat(pad) + "[ " + title + " ]" + BOX.h.repeat(rpad) + BOX.tr;
}
function boxBottom(width: number) { return BOX.bl + BOX.h.repeat(width) + BOX.br; }
function boxDivider(width: number) { return BOX.ml + BOX.h.repeat(width) + BOX.mr; }
function boxRow(content: string, width: number) {
  return BOX.v + " " + content.padEnd(width - 1) + BOX.v;
}

/* ─────────────────────────────────────────────────────────────
   Mini components
───────────────────────────────────────────────────────────── */
function TermLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return <span style={{ color }}>{children}</span>;
}

function TermBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ color, border: `1px solid ${color}55`, padding: "1px 6px", fontSize: "0.75rem" }}>
      {children}
    </span>
  );
}

function TermLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="glow-cyan"
      style={{
        color: "#00ffff",
        textDecoration: "none",
        borderBottom: "1px solid #00ffff44",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#00ffff")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#00ffff44")}
    >
      {children}
    </a>
  );
}

function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="term-entry" style={{ marginBottom: "12px" }}>
      <div className="glow-green" style={{ color: "#00ff41", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.1em" }}>
        {icon} {title.toUpperCase()}
      </div>
      <div style={{ color: "#00ff4166", fontSize: "0.75rem", marginTop: "2px" }}>
        {BOX.lh.repeat(4)} {sub}
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color = "#00ff41" }: { value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 20);
  return (
    <span style={{ color, fontFamily: "monospace" }}>
      [{"█".repeat(pct)}{"░".repeat(20 - pct)}] {value}/{max}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Card components – terminal ASCII style
───────────────────────────────────────────────────────────── */

type HistoryItem = {
  type: "bot" | "user" | "component";
  text?: string;
  component?: React.ReactNode;
};

function AboutCard() {
  const about = PORTFOLIO_DATA.about;
  return (
    <div className="term-entry" style={{ fontFamily: "inherit", color: "#00ff41" }}>
      {/* Top box */}
      <div style={{ color: "#00ff41", whiteSpace: "pre", lineHeight: 1.4 }}>
        {`╔══════════════════════════════════════════════════════════╗
║                    SYSTEM: WHOAMI --FULL                 ║
╠══════════════════════════════════════════════════════════╣`}
      </div>

      {/* Photo + basic info row */}
      <div style={{ display: "flex", gap: "16px", padding: "12px 0" }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ border: "1px solid #00ff4133", padding: "2px" }}>
            <img
              src={about.photo}
              alt={about.name}
              style={{ width: "140px", height: "160px", objectFit: "cover", display: "block", filter: "contrast(1.1) saturate(0.9)" }}
            />
          </div>
          <div style={{ color: "#00ff4155", fontSize: "0.65rem", textAlign: "center", marginTop: "4px" }}>
            ░░ profile.jpg ░░
          </div>
        </div>

        <div style={{ flex: 1, fontSize: "0.82rem", lineHeight: 1.9 }}>
          <div><TermLabel color="#00ff41">USER</TermLabel>    <span style={{ color: "#e0ffe0" }}>{about.name}</span></div>
          <div><TermLabel color="#00ff41">ROLE</TermLabel>    <span style={{ color: "#00ffff" }}>{about.title}</span></div>
          <div><TermLabel color="#00ff41">DEG </TermLabel>    <span style={{ color: "#e0ffe0" }}>{about.education.degree}</span></div>
          <div><TermLabel color="#00ff41">INST</TermLabel>    <span style={{ color: "#e0ffe0" }}>{about.education.college}</span></div>
          <div><TermLabel color="#00ff41">YEAR</TermLabel>    <span style={{ color: "#e0ffe0" }}>{about.education.year}</span></div>
          <div style={{ marginTop: "4px" }}>
            <TermLabel color="#00ff41">LEET</TermLabel>    <span style={{ color: "#ffff00" }}>{about.leetcode.badge}</span>{" "}
            <TermBadge color="#ffff00">{about.leetcode.solved} solved</TermBadge>
          </div>
          <div style={{ marginTop: "4px" }}>
            <TermLabel color="#00ff41">HOBB</TermLabel>    <span style={{ color: "#88ff88" }}>{about.hobbies.join(" · ")}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ color: "#00ff41", whiteSpace: "pre" }}>
        {`╠══════════════════════════════════════════════════════════╣
║  INTRO                                                   ║
╠══════════════════════════════════════════════════════════╣`}
      </div>

      {/* Bio text */}
      <div style={{ color: "#b0ffb0", fontSize: "0.8rem", lineHeight: 1.8, padding: "8px 0", whiteSpace: "pre-wrap" }}>
        {`${BOX.v}  `}{about.intro}{`\n${BOX.v}`}
      </div>

      {/* Divider + links */}
      <div style={{ color: "#00ff41", whiteSpace: "pre", marginBottom: "8px" }}>
        {`╠══════════════════════════════════════════════════════════╣
║  LINKS                                                   ║
╠══════════════════════════════════════════════════════════╣`}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", padding: "6px 0 8px" }}>
        {[
          { label: "[GH]", href: about.socials.github, color: "#00ffff" },
          { label: "[LI]", href: about.socials.linkedin, color: "#00ffff" },
          { label: "[IG]", href: about.socials.instagram, color: "#00ffff" },
          { label: "[MAIL]", href: `mailto:${about.socials.email}`, color: "#00ffff" },
          { label: "[LEETCODE]", href: about.leetcode.profile, color: "#ffff00" },
          { label: "[RESUME.PDF]", href: about.resume, color: "#00ff41" },
        ].map(({ label, href, color }) => (
          <TermLink key={label} href={href}>
            <span style={{ color }}>{label}</span>
          </TermLink>
        ))}
      </div>

      {/* Resume embed */}
      <div style={{ color: "#00ff4155", fontSize: "0.72rem", marginBottom: "4px" }}>
        ┌─ resume.pdf ──────────────────────────────────────────────
      </div>
      <div style={{ border: "1px solid #00ff4122" }}>
        <iframe src={about.resume} title="Resume PDF" style={{ width: "100%", height: "480px", background: "#000", display: "block" }} />
      </div>
      <div style={{ color: "#00ff41", whiteSpace: "pre" }}>
        {`╚══════════════════════════════════════════════════════════╝`}
      </div>
    </div>
  );
}

function ExperienceCard() {
  const { internships, pors } = PORTFOLIO_DATA.experiences;

  const renderItem = (item: { title: string; organization: string; duration: string; description: string }, index: number) => (
    <div key={index} className="term-entry" style={{ marginBottom: "10px" }}>
      <div style={{ color: "#00ffff", fontSize: "0.82rem" }}>
        {BOX.lml}{BOX.lh} <span style={{ fontWeight: 600 }}>{item.title}</span>
      </div>
      <div style={{ paddingLeft: "12px", fontSize: "0.78rem", lineHeight: 1.7 }}>
        <div><TermLabel color="#00ff41">ORG  </TermLabel> <span style={{ color: "#88ffff" }}>{item.organization}</span></div>
        <div><TermLabel color="#00ff41">DATE </TermLabel> <span style={{ color: "#888" }}>{item.duration}</span></div>
        <div style={{ color: "#99ee99", whiteSpace: "pre-wrap", marginTop: "4px", paddingLeft: "6px", borderLeft: "2px solid #00ff4122" }}>
          {item.description}
        </div>
      </div>
    </div>
  );

  return (
    <div className="term-entry" style={{ fontFamily: "inherit", color: "#00ff41" }}>
      <div style={{ whiteSpace: "pre" }}>
        {`╔══════════════════════════════════════════════════════════╗
║              cat experience.log                          ║
╠══════════════════════════════════════════════════════════╣`}
      </div>

      <div style={{ padding: "8px 0 4px" }}>
        <div style={{ color: "#00ff41", fontSize: "0.78rem", marginBottom: "8px" }}>
          {`${BOX.lml}${BOX.lh.repeat(2)} INTERNSHIPS & WORK (${internships.length} entries)`}
        </div>
        {internships.map(renderItem)}
      </div>

      <div style={{ color: "#00ff41", whiteSpace: "pre" }}>
        {`╠══════════════════════════════════════════════════════════╣`}
      </div>

      <div style={{ padding: "8px 0 4px" }}>
        <div style={{ color: "#00ff41", fontSize: "0.78rem", marginBottom: "8px" }}>
          {`${BOX.lml}${BOX.lh.repeat(2)} POSITIONS OF RESPONSIBILITY (${pors.length} entries)`}
        </div>
        {pors.map(renderItem)}
      </div>

      <div style={{ color: "#00ff41", whiteSpace: "pre" }}>
        {`╚══════════════════════════════════════════════════════════╝`}
      </div>
    </div>
  );
}

function ProjectsCard() {
  const projects = PORTFOLIO_DATA.projects;

  return (
    <div className="term-entry" style={{ fontFamily: "inherit", color: "#00ff41" }}>
      <div style={{ whiteSpace: "pre" }}>
        {`╔══════════════════════════════════════════════════════════╗
║              ls -la ~/projects/                          ║
╠══════════════════════════════════════════════════════════╣`}
      </div>

      <div style={{ padding: "6px 0" }}>
        {projects.map((p, i) => (
          <div key={i} className="term-entry" style={{ marginBottom: "16px" }}>
            {/* Project header row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
              <span style={{ color: "#00ff41", fontSize: "0.78rem" }}>{`[${String(i + 1).padStart(2, "0")}]`}</span>
              <span style={{ color: "#00ffff", fontWeight: 600, fontSize: "0.88rem" }}>{p.title}</span>
            </div>

            {/* Image with terminal frame */}
            <div style={{ border: "1px solid #00ff4130", marginBottom: "6px", position: "relative" }}>
              <div style={{ color: "#00ff4144", fontSize: "0.65rem", padding: "2px 6px", borderBottom: "1px solid #00ff4120", background: "#001800" }}>
                ░ {p.title.toLowerCase().replace(/ /g, "_")}.png ░░░░░░░░░░░░░░░░░░░░░░░░░░
              </div>
              <img src={p.image} alt={p.title} style={{ width: "100%", height: "180px", objectFit: "cover", display: "block", filter: "saturate(0.85) contrast(1.05)" }} />
            </div>

            <div style={{ fontSize: "0.78rem", lineHeight: 1.8, paddingLeft: "12px" }}>
              <div style={{ color: "#99ee99", borderLeft: "2px solid #00ff4122", paddingLeft: "8px", marginBottom: "6px" }}>
                {p.description}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <TermLink href={p.github}><span style={{ color: "#00ffff" }}>▸ github</span></TermLink>
                <TermLink href={p.demo}><span style={{ color: "#00ff41" }}>▸ live-demo</span></TermLink>
              </div>
            </div>

            {i < projects.length - 1 && (
              <div style={{ color: "#00ff4120", marginTop: "10px" }}>
                {BOX.lh.repeat(60)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ color: "#00ff41", whiteSpace: "pre" }}>
        {`╚══════════════════════════════════════════════════════════╝`}
      </div>
    </div>
  );
}

function AchievementsCard() {
  const achievements = PORTFOLIO_DATA.achievements;

  return (
    <div className="term-entry" style={{ fontFamily: "inherit", color: "#00ff41" }}>
      <div style={{ whiteSpace: "pre" }}>
        {`╔══════════════════════════════════════════════════════════╗
║              cat achievements.txt                        ║
╠══════════════════════════════════════════════════════════╣`}
      </div>

      <div style={{ padding: "8px 0" }}>
        {achievements.map((a, i) => (
          <div key={i} className="term-entry" style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px", fontSize: "0.8rem" }}>
            <span style={{ color: "#ffff00", flexShrink: 0 }}>★</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e0ffe0", fontWeight: 600 }}>{a.title}</div>
              <div style={{ color: "#00ffff", fontSize: "0.75rem" }}>{a.subtitle}</div>
            </div>
            <TermLink href={a.proof}>
              <span style={{ color: "#00ff41", fontSize: "0.72rem" }}>
                {a.proof.endsWith(".pdf") ? "[cert.pdf]" : "[→ open]"}
              </span>
            </TermLink>
          </div>
        ))}
      </div>

      <div style={{ color: "#00ff41", whiteSpace: "pre" }}>
        {`╚══════════════════════════════════════════════════════════╝`}
      </div>
    </div>
  );
}

function SocialsCard() {
  const { socials, leetcode, resume, name } = PORTFOLIO_DATA.about;

  const items = [
    { label: "GITHUB    ", href: socials.github,           url: socials.github,           color: "#00ffff" },
    { label: "LINKEDIN  ", href: socials.linkedin,         url: socials.linkedin,         color: "#00ffff" },
    { label: "INSTAGRAM ", href: socials.instagram,        url: socials.instagram,        color: "#00ffff" },
    { label: "EMAIL     ", href: `mailto:${socials.email}`, url: socials.email,           color: "#00ffff" },
    { label: "LEETCODE  ", href: leetcode.profile,         url: leetcode.profile,         color: "#ffff00" },
    { label: "RESUME    ", href: resume,                   url: `View ${name}'s resume`,  color: "#00ff41" },
  ];

  return (
    <div className="term-entry" style={{ fontFamily: "inherit", color: "#00ff41" }}>
      <div style={{ whiteSpace: "pre" }}>
        {`╔══════════════════════════════════════════════════════════╗
║              cat /etc/contacts                           ║
╠══════════════════════════════════════════════════════════╣`}
      </div>

      <div style={{ padding: "10px 0", fontSize: "0.8rem" }}>
        {items.map(({ label, href, url, color }) => (
          <div key={label} style={{ display: "flex", gap: "12px", marginBottom: "8px", lineHeight: 1.6 }}>
            <span style={{ color: "#00ff4177", flexShrink: 0 }}>{BOX.v}</span>
            <span style={{ color: "#00ff41", minWidth: "90px" }}>{label}</span>
            <span style={{ color: "#00ff4144" }}>:</span>
            <TermLink href={href}><span style={{ color }}>{url}</span></TermLink>
          </div>
        ))}
      </div>

      <div style={{ color: "#00ff41", whiteSpace: "pre" }}>
        {`╚══════════════════════════════════════════════════════════╝`}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ASCII Art Banner
───────────────────────────────────────────────────────────── */
function Banner() {
  return (
    <div className="glow-green" style={{ color: "#00ff41", whiteSpace: "pre", fontSize: "clamp(0.35rem, 1.2vw, 0.72rem)", lineHeight: 1.3, userSelect: "none", marginBottom: "4px" }}>
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
   Command history item
───────────────────────────────────────────────────────────── */
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
      <div className="term-entry" style={{ display: "flex", gap: "8px", color: "#00ffff", fontSize: "0.83rem", lineHeight: 1.7, marginTop: "8px" }}>
        <span className="glow-cyan" style={{ color: "#00ffff", flexShrink: 0 }}>visitor@portfolio:~$</span>
        <span style={{ color: "#e0ffe0" }}>{item.text?.replace("visitor@portfolio:~$ ", "")}</span>
      </div>
    );
  }

  // bot message
  const isTyping = typingIndex === index;
  const text = isTyping ? typedText : (item.text ?? "");

  return (
    <div className="term-entry" style={{ display: "flex", gap: "8px", color: "#00ff41", fontSize: "0.83rem", lineHeight: 1.8, marginTop: "4px" }}>
      <span style={{ color: "#00ff4155", flexShrink: 0 }}>▸</span>
      <div style={{ whiteSpace: "pre-wrap", flex: 1, color: "#b0ffb0" }}>
        {text}
        {isTyping && <span className="term-cursor" />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Startup screen items (special styling)
───────────────────────────────────────────────────────────── */
function StartupEntry({ item, index }: { item: HistoryItem; index: number }) {
  if (index === 0) {
    return (
      <div className="startup-line" style={{ marginBottom: "2px" }}>
        <Banner />
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="startup-line" style={{ color: "#00ffff", fontSize: "0.8rem", marginBottom: "6px" }}>
        <span className="glow-cyan">{item.text}</span>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="startup-line" style={{ marginBottom: "6px" }}>
        <div style={{ border: "1px solid #00ff4122", padding: "6px 10px", fontSize: "0.77rem", color: "#88ff88", background: "#001800" }}>
          <span style={{ color: "#00ff4188" }}>┌ COMMANDS ────────────────────────────────────────────┐</span>
          <div style={{ padding: "4px 0", display: "flex", flexWrap: "wrap", gap: "8px", paddingLeft: "2px" }}>
            {["whoami", "about", "experience", "projects", "achievements", "socials", "clear", "help"].map(cmd => (
              <span key={cmd} style={{ color: "#00ffff", border: "1px solid #00ffff33", padding: "1px 6px", fontSize: "0.72rem" }}>
                {cmd}
              </span>
            ))}
          </div>
          <span style={{ color: "#00ff4188" }}>└─────────────────────────────────────────────────────┘</span>
        </div>
      </div>
    );
  }
  return (
    <div className="startup-line" style={{ color: "#00ff4166", fontSize: "0.75rem", marginBottom: "4px" }}>
      {item.text}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main terminal
───────────────────────────────────────────────────────────── */
export default function Home() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [typedText, setTypedText] = useState("");
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Startup
  useEffect(() => {
    setHistory([
      { type: "bot", text: "OJASV // TERMINAL PORTFOLIO" },
      { type: "bot", text: "Welcome to my interactive terminal portfolio." },
      { type: "bot", text: "Commands: whoami | about | experience | projects | achievements | socials" },
      { type: "bot", text: 'Type "help" to see available commands.' },
    ]);
  }, []);

  // Auto-scroll on every history / typedText change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [history, typedText]);

  // Typing effect
  useEffect(() => {
    if (typingIndex === null) return;
    const currentItem = history[typingIndex];
    if (!currentItem || currentItem.type !== "bot" || !currentItem.text) {
      setTypingIndex(null);
      setTypedText("");
      return;
    }
    const fullText = currentItem.text;
    if (typedText.length >= fullText.length) { setTypingIndex(null); return; }
    const timer = setTimeout(() => { setTypedText(fullText.slice(0, typedText.length + 1)); }, 10);
    return () => clearTimeout(timer);
  }, [typedText, typingIndex, history]);

  const pushCommandOutput = (command: string, item: HistoryItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((entry) => {
        if (entry.type !== "component") return true;
        const isReactElement = (node: React.ReactNode): node is React.ReactElement =>
          typeof node === "object" && node !== null && "type" in node;
        if (!isReactElement(entry.component)) return true;
        if (command === "about" && entry.component.type === AboutCard) return false;
        if (command === "experience" && entry.component.type === ExperienceCard) return false;
        if (command === "projects" && entry.component.type === ProjectsCard) return false;
        if (command === "achievements" && entry.component.type === AchievementsCard) return false;
        if (command === "socials" && entry.component.type === SocialsCard) return false;
        return true;
      });
      return [
        ...filtered,
        { type: "user", text: `visitor@portfolio:~$ ${command}` },
        item,
      ];
    });

    if (item.type === "bot") {
      setTypedText("");
      setTypingIndex(history.length + 1);
    } else {
      setTypedText("");
      setTypingIndex(null);
    }
  };

  const handleCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === "clear") {
      setHistory([]);
      setTypedText("");
      setTypingIndex(null);
      return;
    }

    if (cmd === "help") {
      pushCommandOutput(command, {
        type: "bot",
        text: "Available commands:\n  whoami        → quick identity summary\n  about         → full profile + resume\n  experience    → internships & PORs\n  projects      → portfolio work\n  achievements  → awards & certs\n  socials       → links & contacts\n  clear         → wipe terminal\n  help          → this message",
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
    if (cmd === "about") { pushCommandOutput(command, { type: "component", component: <AboutCard /> }); return; }
    if (cmd === "experience") { pushCommandOutput(command, { type: "component", component: <ExperienceCard /> }); return; }
    if (cmd === "projects") { pushCommandOutput(command, { type: "component", component: <ProjectsCard /> }); return; }
    if (cmd === "achievements") { pushCommandOutput(command, { type: "component", component: <AchievementsCard /> }); return; }
    if (cmd === "socials") { pushCommandOutput(command, { type: "component", component: <SocialsCard /> }); return; }

    pushCommandOutput(command, { type: "bot", text: `bash: ${cmd}: command not found\nType 'help' for available commands.` });
  };

  return (
    <>
      <style>{TERMINAL_STYLES}</style>
      <main
        style={{
          height: "100vh",
          overflow: "hidden",
          background: "#000",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color: "#00ff41",
          position: "relative",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Scanlines overlay */}
        <div className="scanlines" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }} />

        {/* Ambient glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,65,0.06) 0%, transparent 60%)",
          zIndex: 0,
        }} />

        <div
          className="crt-flicker"
          style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", maxWidth: "900px", margin: "0 auto", padding: "0 8px" }}
        >

          {/* ── Title bar ── */}
          <div style={{
            borderBottom: "1px solid #00ff4133",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#001800",
            flexShrink: 0,
          }}>
            {/* Traffic lights */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57", boxShadow: "0 0 4px #ff5f57aa" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#febc2e", boxShadow: "0 0 4px #febc2eaa" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840", boxShadow: "0 0 4px #28c840aa" }} />
            </div>

            {/* Title */}
            <div className="glow-green" style={{ color: "#00ff41", fontSize: "0.72rem", letterSpacing: "0.15em" }}>
              terminal-portfolio — bash — 220×50
            </div>

            {/* Status */}
            <div style={{ color: "#00ff4166", fontSize: "0.65rem" }}>
              ● ONLINE
            </div>
          </div>

          {/* ── Toolbar / breadcrumb ── */}
          <div style={{
            padding: "4px 12px",
            background: "#000e00",
            borderBottom: "1px solid #00ff4118",
            fontSize: "0.68rem",
            color: "#00ff4155",
            flexShrink: 0,
            display: "flex",
            gap: "16px",
          }}>
            <span>uptime: ∞</span>
            <span>shell: bash 5.2</span>
            <span>user: visitor</span>
            <span style={{ color: "#00ff4188" }}>pwd: ~/portfolio</span>
          </div>

          {/* ── Output area ── */}
          <div
            ref={scrollRef}
            className="term-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "12px 12px 8px",
              background: "#000800",
            }}
          >
            {history.map((item, index) => {
              const isStartup = index <= 3 && item.type === "bot";
              if (isStartup) {
                return <StartupEntry key={index} item={item} index={index} />;
              }
              return (
                <HistoryEntry
                  key={index}
                  item={item}
                  index={index}
                  typingIndex={typingIndex}
                  typedText={typedText}
                />
              );
            })}

            {/* Trailing empty space so last output isn't at the very bottom edge */}
            <div style={{ height: "8px" }} />
          </div>

          {/* ── Input line ── */}
          <div style={{
            flexShrink: 0,
            borderTop: "1px solid #00ff4133",
            background: "#000e00",
            padding: "8px 12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="glow-cyan" style={{ color: "#00ffff", fontSize: "0.83rem", flexShrink: 0 }}>
                visitor@portfolio:~$
              </span>
              <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
                <input
                  ref={inputRef}
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { handleCommand(input); setInput(""); }
                  }}
                  className="term-input"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    color: "#e0ffe0",
                    fontSize: "0.83rem",
                    fontFamily: "inherit",
                    caretColor: "#00ff41",
                  }}
                  placeholder=""
                  spellCheck={false}
                  autoComplete="off"
                />
                {!input && <span className="term-cursor" />}
              </div>
            </div>

            {/* Bottom hint bar */}
            <div style={{ marginTop: "5px", fontSize: "0.62rem", color: "#00ff4133", display: "flex", gap: "16px" }}>
              <span>⏎ execute</span>
              <span>help → commands</span>
              <span>clear → reset</span>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
