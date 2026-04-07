"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  HiOutlineBookOpen,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineTrendingUp,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineChevronRight,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import { HiOutlineSparkles } from "react-icons/hi2";

// ─── Stagger wrapper ──────────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
  y = 20,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: <HiOutlineBookOpen className="w-5 h-5" />,
    title: "Lesson Generator",
    desc: "Generate structured, curriculum-aligned lesson plans in seconds from a single topic or syllabus prompt.",
    accent: "#6366f1",
    accentBg: "#eef2ff",
    accentBorder: "#c7d2fe",
    tag: "Core",
  },
  {
    icon: <HiOutlineStar className="w-5 h-5" />,
    title: "Smart Grading",
    desc: "Evaluate student answers using an AI rubric engine with instant, detailed per-student feedback and scores.",
    accent: "#059669",
    accentBg: "#f0fdf4",
    accentBorder: "#bbf7d0",
    tag: "Core",
  },
  {
    icon: <HiOutlineChartBar className="w-5 h-5" />,
    title: "Performance Analysis",
    desc: "Surface weak topics and learning gaps per student before they compound into long-term problems.",
    accent: "#d97706",
    accentBg: "#fffbeb",
    accentBorder: "#fde68a",
    tag: "Insights",
  },
];

const steps = [
  { num: "01", title: "Generate lesson",  desc: "AI builds a plan from your topic",          status: "done"    },
  { num: "02", title: "Conduct quiz",     desc: "Auto-generated quiz questions",              status: "done"    },
  { num: "03", title: "Collect results",  desc: "Answers structured automatically",           status: "active"  },
  { num: "04", title: "AI insights",      desc: "Weak topics flagged per student",            status: "pending" },
  { num: "05", title: "Improve",          desc: "Targeted lesson revisions suggested",        status: "pending" },
];

const grades = [
  { init: "AS", name: "Aarav Singh",  answer: "x = (-b ± √(b²-4ac)) / 2a",       score: "10/10", pct: 100, status: "pass"    as const },
  { init: "PS", name: "Priya Sharma", answer: "x = -b/2a only",                   score: "5/10",  pct: 50,  status: "partial" as const },
  { init: "RM", name: "Rohan Mehta",  answer: "I don't remember the formula",     score: "0/10",  pct: 0,   status: "fail"    as const },
  { init: "AP", name: "Ananya Patel", answer: "x = (-b ± √D)/2a, D = b²-4ac",    score: "10/10", pct: 100, status: "pass"    as const },
];

const statusMap = {
  pass:    { label: "Correct",  scoreColor: "#059669", barColor: "#059669", initBg: "#f0fdf4", initColor: "#065f46", badgeBg: "#f0fdf4", badgeColor: "#065f46" },
  partial: { label: "Partial",  scoreColor: "#d97706", barColor: "#d97706", initBg: "#fffbeb", initColor: "#78350f", badgeBg: "#fffbeb", badgeColor: "#78350f" },
  fail:    { label: "Wrong",    scoreColor: "#e11d48", barColor: "#e11d48", initBg: "#fff1f2", initColor: "#881337", badgeBg: "#fff1f2", badgeColor: "#881337" },
};

const stepMap = {
  done:    { bg: "#111827", color: "#f9fafb", border: "#111827" },
  active:  { bg: "#f0fdf4", color: "#065f46", border: "#bbf7d0" },
  pending: { bg: "#ffffff", color: "#9ca3af", border: "#e5e7eb" },
};

const stats = [
  { val: "45",  label: "Students tracked",  icon: <HiOutlineUsers className="w-3.5 h-3.5" /> },
  { val: "76%", label: "Class average",     icon: <HiOutlineTrendingUp className="w-3.5 h-3.5" /> },
  { val: "3/5", label: "Lessons done",      icon: <HiOutlineBookOpen className="w-3.5 h-3.5" /> },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClassIntelHome() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .ci-root { font-family: 'DM Sans', system-ui, sans-serif; }
        .ci-serif { font-family: 'Instrument Serif', Georgia, serif; }

        @keyframes ci-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes ci-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes ci-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }

        .ci-live-dot { animation: ci-pulse 2s ease-in-out infinite; }
        .ci-float    { animation: ci-float 4s ease-in-out infinite; }

        .ci-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }
        .ci-card:hover {
          box-shadow: 0 12px 40px -8px rgba(0,0,0,0.09);
          transform: translateY(-2px);
          border-color: #d1d5db;
        }

        .ci-score-bar {
          height: 3px;
          border-radius: 99px;
          background: #f3f4f6;
          overflow: hidden;
        }
        .ci-score-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 1.2s cubic-bezier(0.34,1.56,0.64,1);
        }

        .ci-tag {
          display: inline-flex;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 99px;
        }

        .ci-step-connector {
          position: absolute;
          top: 18px;
          left: calc(10% + 18px);
          right: calc(10% + 18px);
          height: 1px;
          background: linear-gradient(90deg, #111827 0%, #111827 40%, #e5e7eb 40%, #e5e7eb 100%);
        }

        .ci-insight {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 1px solid #fde68a;
          border-radius: 20px;
        }

        .ci-hero-bg {
          background:
            radial-gradient(ellipse 600px 400px at 70% 0%, rgba(99,102,241,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 400px 300px at 0% 100%, rgba(5,150,105,0.04) 0%, transparent 70%),
            #f8fafc;
        }

        .ci-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }
        .ci-divider-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9ca3af;
          white-space: nowrap;
        }
        .ci-divider-line {
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }
      `}</style>

      <div className="ci-root ci-hero-bg min-h-screen text-stone-900" style={{ zIndex: 0, position: "relative" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 24px 80px" }}>

          {/* ─── HERO ───────────────────────────────────────────────── */}
          <section style={{ paddingTop: 56, paddingBottom: 64, display: "grid", gridTemplateColumns: "1fr", gap: 40, alignItems: "center" }}
            className="lg:!grid-cols-[1fr_380px]">

            {/* Left copy */}
            <div>
              {/* Live badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#059669", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 14px", borderRadius: 99, marginBottom: 22 }}
              >
                <span className="ci-live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
                AI-powered education platform
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="ci-serif"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: "clamp(38px, 5vw, 52px)", lineHeight: 1.06, letterSpacing: "-0.02em", color: "#0f172a", marginBottom: 18, fontWeight: 400 }}
              >
                Teaching that<br />
                <em style={{ color: "#9ca3af", fontStyle: "italic" }}>learns back.</em>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.14 }}
                style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.75, maxWidth: 440, marginBottom: 28 }}
              >
                ClassIntel automates lesson planning, grades student answers against
                AI rubrics, and surfaces learning gaps before they become failures.
              </motion.p>

              {/* Pills */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}
              >
                {["No setup required", "Demo data included", "Open source ready"].map((t) => (
                  <span
                    key={t}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, padding: "6px 13px", borderRadius: 99, background: "#fff", border: "1px solid #e5e7eb", color: "#6b7280" }}
                  >
                    <HiOutlineCheckCircle style={{ width: 12, height: 12, color: "#059669", flexShrink: 0 }} />
                    {t}
                  </span>
                ))}
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28, duration: 0.5 }}
                style={{ display: "flex", alignItems: "center", gap: 0 }}
              >
                {stats.map((s, i) => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                    {i > 0 && <div style={{ width: 1, height: 40, background: "#e5e7eb", margin: "0 28px" }} />}
                    <div>
                      <div className="ci-serif" style={{ fontSize: 32, letterSpacing: "-0.03em", color: "#0f172a", lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        {s.icon} {s.label}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — grading card */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="ci-float"
              style={{ display: "none", background: "#fff", borderRadius: 22, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 20px 60px -12px rgba(0,0,0,0.1)" }}
              // Show on lg via inline override below
            >
              {/* hidden on mobile via class */}
              <div style={{ background: "#0f172a", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: "#f1f5f9" }}>
                  <HiOutlineStar style={{ width: 13, height: 13, color: "#4ade80" }} />
                  Smart Grading
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(74,222,128,0.12)", color: "#4ade80", padding: "3px 10px", borderRadius: 99, letterSpacing: "0.06em", textTransform: "uppercase" }}>AI graded</span>
              </div>

              <div style={{ padding: 18 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 3 }}>Quiz: Quadratic Equations</p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>Rubric: State the formula correctly — 10 pts</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {grades.map((g, gi) => {
                    const s = statusMap[g.status];
                    return (
                      <motion.div
                        key={g.name}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + gi * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, border: "1px solid #f1f5f9", background: "#fafafa" }}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: s.initBg, color: s.initColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                          {g.init}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{g.name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.answer}</div>
                          <div className="ci-score-bar" style={{ marginTop: 5 }}>
                            <motion.div
                              className="ci-score-bar-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${g.pct}%` }}
                              transition={{ delay: 0.6 + gi * 0.1, duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                              style={{ background: s.barColor }}
                            />
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: s.badgeBg, color: s.badgeColor, flexShrink: 0 }}>
                          {g.score}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: "11px 18px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", gap: 16, fontSize: 11, color: "#94a3b8" }}>
                <span>Avg: <strong style={{ color: "#1e293b" }}>64%</strong></span>
                <span>Passed: <strong style={{ color: "#059669" }}>2/4</strong></span>
                <span>Needs review: <strong style={{ color: "#e11d48" }}>1</strong></span>
              </div>
            </motion.div>

            {/* Desktop-only card — show via CSS */}
            <style>{`
              @media (min-width: 1024px) {
                .ci-grading-card { display: block !important; }
              }
            `}</style>
            <motion.div
              className="ci-grading-card"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "none", background: "#fff", borderRadius: 22, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 20px 60px -12px rgba(0,0,0,0.1)" }}
            >
              <div style={{ background: "#0f172a", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: "#f1f5f9" }}>
                  <HiOutlineStar style={{ width: 13, height: 13, color: "#4ade80" }} />
                  Smart Grading
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(74,222,128,0.12)", color: "#4ade80", padding: "3px 10px", borderRadius: 99, letterSpacing: "0.06em", textTransform: "uppercase" }}>AI graded</span>
              </div>

              <div style={{ padding: 18 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 3 }}>Quiz: Quadratic Equations</p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>Rubric: State the formula correctly — 10 pts</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {grades.map((g, gi) => {
                    const s = statusMap[g.status];
                    return (
                      <motion.div
                        key={g.name}
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.38 + gi * 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, border: "1px solid #f1f5f9", background: "#fafafa" }}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: s.initBg, color: s.initColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                          {g.init}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{g.name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.answer}</div>
                          <div className="ci-score-bar" style={{ marginTop: 5 }}>
                            <motion.div
                              className="ci-score-bar-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${g.pct}%` }}
                              transition={{ delay: 0.65 + gi * 0.1, duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                              style={{ background: s.barColor }}
                            />
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: s.badgeBg, color: s.badgeColor, flexShrink: 0 }}>
                          {g.score}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: "11px 18px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", gap: 16, fontSize: 11, color: "#94a3b8" }}>
                <span>Avg: <strong style={{ color: "#1e293b" }}>64%</strong></span>
                <span>Passed: <strong style={{ color: "#059669" }}>2/4</strong></span>
                <span>Needs review: <strong style={{ color: "#e11d48" }}>1</strong></span>
              </div>
            </motion.div>
          </section>

          {/* ─── FEATURES ──────────────────────────────────────────────── */}
          <FadeIn>
            <div className="ci-divider">
              <span className="ci-divider-label">Core features</span>
              <div className="ci-divider-line" />
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 64 }}>
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.09}>
                <motion.div
                  className="ci-card"
                  whileHover={{ y: -4, boxShadow: "0 16px 48px -10px rgba(0,0,0,0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14, height: "100%", cursor: "default" }}
                >
                  {/* Icon + tag row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: f.accentBg, border: `1px solid ${f.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: f.accent }}>
                      {f.icon}
                    </div>
                    <span className="ci-tag" style={{ background: f.accentBg, color: f.accent, border: `1px solid ${f.accentBorder}` }}>{f.tag}</span>
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, flex: 1 }}>{f.desc}</div>

                  <motion.div
                    whileHover={{ x: 3 }}
                    style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: f.accent, cursor: "pointer" }}
                  >
                    Learn more <HiOutlineChevronRight style={{ width: 12, height: 12 }} />
                  </motion.div>
                </motion.div>
              </FadeIn>
            ))}
          </div>

          {/* ─── HOW IT WORKS ──────────────────────────────────────────── */}
          <FadeIn>
            <div className="ci-divider">
              <span className="ci-divider-label">How it works</span>
              <div className="ci-divider-line" />
            </div>
          </FadeIn>

          <FadeIn delay={0.04} className="mb-16">
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0 }}>
              {/* Connector */}
              <div className="ci-step-connector" />

              {steps.map((s, i) => {
                const st = stepMap[s.status as keyof typeof stepMap];
                return (
                  <motion.div
                    key={s.num}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      style={{ width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${st.border}`, background: st.bg, color: st.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, letterSpacing: "0.02em" }}
                    >
                      {s.status === "done" ? <HiOutlineCheckCircle style={{ width: 16, height: 16 }} /> : s.num}
                    </motion.div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: s.status === "pending" ? "#9ca3af" : "#111827" }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.45, marginTop: 3, padding: "0 4px" }}>{s.desc}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </FadeIn>

          {/* ─── AI INSIGHT ─────────────────────────────────────────────── */}
          <FadeIn className="mb-8">
            <motion.div
              className="ci-insight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ padding: 22, display: "flex", alignItems: "flex-start", gap: 16 }}
            >
              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -4, 4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                style={{ width: 42, height: 42, borderRadius: 13, background: "#fef3c7", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <HiOutlineExclamation style={{ width: 18, height: 18, color: "#b45309" }} />
              </motion.div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>AI insight — attention needed</span>
                  <span className="ci-live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#d97706", display: "inline-block" }} />
                </div>
                <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.7, margin: 0 }}>
                  Algebra is the weakest topic across Class 10-B at <strong>48% mastery</strong>. 12 students are below
                  the passing threshold. The AI recommends revising Lesson 3 before the next assessment.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                  {[
                    { label: "Algebra — 48%",      bg: "#fef3c7", color: "#92400e" },
                    { label: "12 students at risk", bg: "#fff1f2", color: "#881337" },
                    { label: "Lesson 3 flagged",    bg: "#f3f4f6", color: "#374151" },
                  ].map(chip => (
                    <motion.span
                      key={chip.label}
                      whileHover={{ scale: 1.04 }}
                      style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: chip.bg, color: chip.color, cursor: "default" }}
                    >
                      {chip.label}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </FadeIn>

        </div>

        {/* ─── FOOTER ──────────────────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid #e5e7eb", background: "#fff", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="ci-serif" style={{ fontSize: 17, color: "#111827" }}>ClassIntel</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Built for educators · Hackathon Demo 2025</span>
        </footer>
      </div>
    </>
  );
}