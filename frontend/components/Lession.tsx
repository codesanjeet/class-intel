"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuBookOpen, LuSparkles, LuTarget, LuListChecks, LuPuzzle,
  LuClipboardList, LuChevronRight, LuLoader, LuImagePlus, LuX,
  LuInfo, LuCircleCheck, LuCircleX, LuTrophy, LuZap,
  LuUsers, LuTriangleAlert, LuRefreshCw, LuHistory,
  LuChevronDown, LuBellRing, LuUser, LuFlame, LuArrowLeft,
  LuSchool,
} from "react-icons/lu";

// ── Types ──────────────────────────────────────────────────────────────────────

interface TopicContent {
  topic: string;
  estimated_duration_minutes?: number;
  difficulty_level?: string;
  tags?: string[];
  objectives: string[];
  teaching_steps: string[];
  activities: string[];
  homework: string[];
  revision_note?: string;
  teaching_tip?: string;
  common_mistakes?: string[];
}
interface QuizQuestion {
  topic: string; question: string; options: string[];
  answer: string; explanation: string; difficulty: string; marks: number;
}
interface WeakTopic {
  topic: string; wrong_count: number; total_questions: number; accuracy: number; insight: string;
}
interface StudentRecord {
  name: string; correct: number; total: number; score_pct: number; answers: Record<string, string>;
}
interface SimulateResponse {
  lesson_id: number; topic: string; students: StudentRecord[];
  avg_score: number; below50_count: number; needs_revision: boolean;
  weak_topics: WeakTopic[]; remark: string;
}
interface LessonResponse {
  id: number; subject?: string; topic?: string; className?: string;
  lessonContent: TopicContent[]; quiz: QuizQuestion[];
}
interface PrevLesson {
  id: number; topic: string; subject?: string; className?: string;
  avg_score: number; attempt_count: number; is_completed: boolean; created_at: string;
}
interface ImageSlot { file: File; preview: string; }

// ── Config ─────────────────────────────────────────────────────────────────────

const BASE_URL = "https://class-intel.onrender.com";
// const BASE_URL = "http://localhost:8000";
const MAX_IMAGES = 8;
const SAVED_RULE_KEY = "lessonai_saved_institution_rule";

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(pct: number) {
  if (pct >= 70) return { stroke: "#059669", bg: "#f0fdf4", border: "#bbf7d0", text: "#065f46" };
  if (pct >= 50) return { stroke: "#d97706", bg: "#fffbeb", border: "#fde68a", text: "#78350f" };
  return { stroke: "#e11d48", bg: "#fff1f2", border: "#fecdd3", text: "#881337" };
}

function useImageSlots() {
  const [slots, setSlots] = useState<ImageSlot[]>([]);
  const add = useCallback((files: FileList | File[]) => {
    setSlots(prev => {
      const rem = MAX_IMAGES - prev.length;
      return [...prev, ...Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, rem)
        .map(file => ({ file, preview: URL.createObjectURL(file) }))];
    });
  }, []);
  const remove = useCallback((i: number) => {
    setSlots(prev => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, j) => j !== i); });
  }, []);
  return { slots, add, remove };
}

// ── ScoreRing ──────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const col = scoreColor(score);
  const R = size / 2 - 7;
  const C = 2 * Math.PI * R;
  const pct = Math.min(score / 100, 1);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={col.border} strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={col.stroke} strokeWidth={5}
          strokeDasharray={`${C * pct} ${C}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.24, fontWeight: 800, color: col.stroke, lineHeight: 1, fontFamily: "'Syne',sans-serif" }}>{score}</span>
        <span style={{ fontSize: size * 0.13, color: "#9ca3af", fontWeight: 600 }}>%</span>
      </div>
    </div>
  );
}

// ── UploadSection ──────────────────────────────────────────────────────────────

function UploadSection({ label, hint, accent, slots, onAdd, onRemove, required = false }: {
  label: string; hint: string; accent: string; slots: ImageSlot[];
  onAdd: (f: FileList | File[]) => void; onRemove: (i: number) => void; required?: boolean;
}) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const full = slots.length >= MAX_IMAGES;

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: accent, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: "#111827", fontFamily: "'Syne',sans-serif" }}>{label}</span>
        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 7, fontWeight: 700,
          background: required ? "#fef2f2" : "#f3f4f6", color: required ? "#dc2626" : "#9ca3af" }}>
          {required ? "Required" : "Optional"}
        </span>
        {slots.length > 0 && <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{slots.length}/{MAX_IMAGES}</span>}
      </div>
      <div style={{ padding: 12 }}>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, lineHeight: 1.5 }}>{hint}</p>
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); onAdd(e.dataTransfer.files); }}
          onClick={() => !full && ref.current?.click()}
          style={{ borderRadius: 12, border: drag ? `2px solid ${accent}` : slots.length ? "1.5px solid #e5e7eb" : "2px dashed #e5e7eb", background: drag ? "#f5f3ff" : slots.length ? "#fff" : "#fafafa", padding: slots.length ? 8 : "20px 12px", cursor: full ? "default" : "pointer", transition: "all 0.2s" }}
        >
          <input ref={ref} type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={e => { if (e.target.files) onAdd(e.target.files); e.target.value = ""; }} />
          {slots.length === 0 ? (
            <div style={{ textAlign: "center" }}>
              <LuImagePlus style={{ width: 28, height: 28, color: "#d1d5db", margin: "0 auto 8px" }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 3 }}>Drop images here</p>
              <p style={{ fontSize: 11, color: "#9ca3af" }}>or tap to browse · up to {MAX_IMAGES}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {slots.map((s, i) => (
                <div key={i} style={{ position: "relative", aspectRatio: "3/4", borderRadius: 8, overflow: "hidden", border: "1.5px solid #e5e7eb" }}>
                  <img src={s.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={e => { e.stopPropagation(); onRemove(i); }} style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: 5, background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LuX style={{ width: 10, height: 10 }} />
                  </button>
                  <div style={{ position: "absolute", bottom: 3, left: 4, fontSize: 9, color: "#fff", background: "rgba(0,0,0,0.45)", borderRadius: 3, padding: "1px 5px", fontWeight: 700 }}>pg {i+1}</div>
                </div>
              ))}
              {!full && (
                <div onClick={() => ref.current?.click()} style={{ aspectRatio: "3/4", borderRadius: 8, border: "1.5px dashed #e5e7eb", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", cursor: "pointer", gap: 2 }}>
                  <span style={{ fontSize: 20, color: "#d1d5db", lineHeight: 1 }}>+</span>
                  <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>add</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PrevLessonsPanel ───────────────────────────────────────────────────────────

function PrevLessonsPanel({ onOpen }: { onOpen: (id: number) => void }) {
  const [lessons, setLessons] = useState<PrevLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/lesson-generator/all`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setLessons(Array.isArray(d) ? d : []))
      .catch(() => setLessons([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: "14px 16px", background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 9 }}>
      <LuLoader style={{ width: 14, height: 14, color: "#9ca3af", animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: 13, color: "#9ca3af" }}>Loading previous lessons…</span>
    </div>
  );
  if (!lessons.length) return null;

  const visible = expanded ? lessons : lessons.slice(0, 4);

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "13px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 9 }}>
        <LuHistory style={{ width: 15, height: 15, color: "#6366f1" }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: "#111827", fontFamily: "'Syne',sans-serif" }}>Previous Lessons</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{lessons.length} total</span>
      </div>
      {visible.map((l, i) => {
        const col  = scoreColor(l.avg_score);
        const bad  = l.is_completed && l.avg_score < 60;
        return (
          <div key={l.id} onClick={() => onOpen(l.id)}
            style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 11, cursor: "pointer", borderBottom: i < visible.length - 1 ? "1px solid #f9fafb" : "none", transition: "background 0.12s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width: 36, height: 36, borderRadius: 11, background: l.is_completed ? col.bg : "#f9fafb", border: `1.5px solid ${l.is_completed ? col.border : "#e5e7eb"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LuBookOpen style={{ width: 14, height: 14, color: l.is_completed ? col.stroke : "#9ca3af" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.topic}</p>
                {bad && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: "#fef2f2", color: "#dc2626", fontWeight: 800, flexShrink: 0 }}>REVISE</span>}
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {[l.subject, l.className].filter(Boolean).join(" · ") || "No details"}
                {l.attempt_count > 0 && ` · ${l.attempt_count} students`}
              </p>
            </div>
            {l.is_completed ? (
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: col.stroke, fontFamily: "'Syne',sans-serif" }}>{l.avg_score}%</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>avg</div>
              </div>
            ) : (
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, flexShrink: 0 }}>No data</span>
            )}
            <LuChevronRight style={{ width: 12, height: 12, color: "#d1d5db", flexShrink: 0 }} />
          </div>
        );
      })}
      {lessons.length > 4 && (
        <button onClick={() => setExpanded(v => !v)} style={{ width: "100%", padding: "10px", border: "none", borderTop: "1px solid #f3f4f6", background: "#f9fafb", color: "#6b7280", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <LuChevronDown style={{ width: 12, height: 12, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          {expanded ? "Show less" : `Show ${lessons.length - 4} more`}
        </button>
      )}
    </div>
  );
}

// ── TopicCard ──────────────────────────────────────────────────────────────────

const SECS = [
  { key: "objectives" as const,     label: "Objectives",     icon: LuTarget,        stroke: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { key: "teaching_steps" as const, label: "Teaching Steps", icon: LuListChecks,    stroke: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "activities" as const,     label: "Activities",     icon: LuPuzzle,        stroke: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { key: "homework" as const,       label: "Homework",       icon: LuClipboardList, stroke: "#d97706", bg: "#fffbeb", border: "#fde68a" },
];

function TopicCard({ c, idx, revise }: { c: TopicContent; idx: number; revise?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#fff", border: revise ? "1.5px solid #fca5a5" : "1.5px solid #e5e7eb", borderRadius: 18, overflow: "hidden", boxShadow: revise ? "0 2px 14px rgba(225,29,72,0.08)" : "0 1px 6px rgba(0,0,0,0.04)", animation: `slideUp ${0.3 + idx * 0.07}s ease both` }}>
      <div style={{ height: 4, background: revise ? "linear-gradient(90deg,#e11d48,#fb7185)" : `linear-gradient(90deg,#6366f1,transparent)` }} />
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#111827", fontFamily: "'Syne',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{c.topic}</span>
          {revise && (
            <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 7, background: "#fef2f2", color: "#e11d48", fontWeight: 800, border: "1px solid #fecdd3", display: "flex", alignItems: "center", gap: 4 }}>
              <LuBellRing style={{ width: 9, height: 9 }} /> Revision Required
            </span>
          )}
          {c.difficulty_level && (
            <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 7, fontWeight: 700,
              background: c.difficulty_level === "easy" ? "#f0fdf4" : c.difficulty_level === "hard" ? "#fff1f2" : "#fffbeb",
              color:      c.difficulty_level === "easy" ? "#059669" : c.difficulty_level === "hard" ? "#e11d48" : "#d97706",
              border:     `1px solid ${c.difficulty_level === "easy" ? "#bbf7d0" : c.difficulty_level === "hard" ? "#fecdd3" : "#fde68a"}`,
            }}>{c.difficulty_level}</span>
          )}
          {c.estimated_duration_minutes && (
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginLeft: "auto" }}>⏱ {c.estimated_duration_minutes} min</span>
          )}
        </div>
        {c.tags && c.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {c.tags.map(t => <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 7, background: "#f3f4f6", color: "#6b7280", fontWeight: 600 }}>{t}</span>)}
          </div>
        )}
      </div>

      {SECS.map(s => {
        const items: string[] = c[s.key] ?? [];
        if (!items.length) return null;
        const Icon = s.icon;
        return (
          <div key={s.key} style={{ padding: "11px 16px", borderBottom: "1px solid #f9fafb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 11, height: 11, color: s.stroke }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: s.stroke }}>{s.label}</span>
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                <LuChevronRight style={{ width: 11, height: 11, color: s.stroke, flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        );
      })}

      {(c.teaching_tip || c.revision_note || (c.common_mistakes?.length ?? 0) > 0) && (
        <>
          <button onClick={() => setOpen(v => !v)} style={{ width: "100%", padding: "10px 16px", border: "none", background: "#f9fafb", color: "#6b7280", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <LuChevronDown style={{ width: 12, height: 12, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            {open ? "Hide" : "Show"} Tips & Notes
          </button>
          {open && (
            <div style={{ padding: "12px 16px", background: revise ? "#fff5f5" : "#fffbeb", animation: "fadeIn 0.25s ease" }}>
              {c.teaching_tip && (
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#d97706", minWidth: 52 }}>💡 Tip</span>
                  <span style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>{c.teaching_tip}</span>
                </div>
              )}
              {c.revision_note && (
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#2563eb", minWidth: 52 }}>📝 Note</span>
                  <span style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>{c.revision_note}</span>
                </div>
              )}
              {c.common_mistakes?.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#e11d48", minWidth: 52 }}>⚠ Avoid</span>
                  <span style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>{m}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Loading Steps ──────────────────────────────────────────────────────────────

const STEPS = [
  "Enrolling 22 virtual students…",
  "Students are taking the test…",
  "Grading answer sheets…",
  "Computing class average…",
  "Identifying weak areas…",
  "Writing teacher's remark…",
];

function DemoLoader() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", padding: "18px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}>
          <LuRefreshCw style={{ width: 15, height: 15, color: "#6366f1" }} />
        </motion.div>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#111827", fontFamily: "'Syne',sans-serif" }}>Running simulation…</span>
      </div>
      {STEPS.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7, opacity: i <= step ? 1 : 0.2, transition: "opacity 0.4s" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: i < step ? "#059669" : i === step ? "#6366f1" : "#f3f4f6", transition: "background 0.3s" }}>
            {i < step ? <LuCircleCheck style={{ width: 11, height: 11, color: "#fff" }} /> :
             i === step ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} /></motion.div> :
             <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#d1d5db" }} />}
          </div>
          <span style={{ fontSize: 12, color: i === step ? "#111827" : i < step ? "#059669" : "#9ca3af", fontWeight: i === step ? 700 : 400 }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

// ── SimResultsPanel ────────────────────────────────────────────────────────────

function SimResultsPanel({ sim, questions }: { sim: SimulateResponse; questions: QuizQuestion[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const col      = scoreColor(sim.avg_score);
  const firstTQ  = questions.filter(q => q.topic === (questions[0]?.topic ?? ""));
  const grade    = sim.avg_score >= 70 ? "Good" : sim.avg_score >= 50 ? "Average" : "Poor";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Hero score */}
      <div style={{ background: "#fff", borderRadius: 18, border: `1.5px solid ${col.border}`, padding: "16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}>
        <ScoreRing score={sim.avg_score} size={80} />
        <div style={{ flex: 1, minWidth: 120 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4, fontWeight: 700 }}>Class Average</p>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 7, background: col.bg, color: col.text, fontWeight: 800, border: `1px solid ${col.border}` }}>{grade}</span>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{sim.students.length} students</span>
          </div>
          <div style={{ height: 5, background: "#f3f4f6", borderRadius: 99, marginBottom: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${sim.avg_score}%` }} transition={{ duration: 1.2, ease: [0.34,1.56,0.64,1] }}
              style={{ height: "100%", background: col.stroke, borderRadius: 99 }} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { v: sim.below50_count, l: "Below 50%", c: "#e11d48", icon: LuCircleX },
              { v: sim.students.filter(s => s.score_pct >= 60).length, l: "Above 60%", c: "#059669", icon: LuCircleCheck },
            ].map(({ v, l, c, icon: Icon }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon style={{ width: 11, height: 11, color: c }} />
                <span style={{ fontSize: 11, color: "#6b7280" }}><strong style={{ color: "#111827" }}>{v}</strong> {l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weak areas */}
      {sim.weak_topics.some(w => w.wrong_count > 0) && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 16, padding: "13px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
            <LuFlame style={{ width: 13, height: 13, color: "#d97706" }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#78350f", fontFamily: "'Syne',sans-serif" }}>Weak Areas</span>
          </div>
          {sim.weak_topics.filter(w => w.wrong_count > 0).map(w => {
            const wc = scoreColor(w.accuracy);
            return (
              <div key={w.topic} style={{ background: "#fff", borderRadius: 10, padding: "10px 11px", marginBottom: 7, border: "1px solid #fde68a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{w.topic}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: wc.stroke }}>{w.accuracy}%</span>
                </div>
                <div style={{ height: 4, background: "#f3f4f6", borderRadius: 99, marginBottom: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${w.accuracy}%`, background: wc.stroke, borderRadius: 99 }} />
                </div>
                <p style={{ fontSize: 11, color: "#78350f", margin: 0 }}>{w.insight}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Records */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "11px 14px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
          <LuUsers style={{ width: 13, height: 13, color: "#6366f1" }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: "#111827", fontFamily: "'Syne',sans-serif" }}>Student Records</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{sim.students.length} total</span>
        </div>
        {/* Distribution bar */}
        <div style={{ padding: "9px 14px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", height: 20, borderRadius: 7, overflow: "hidden", gap: 1.5 }}>
            {sim.students.slice().sort((a, b) => a.score_pct - b.score_pct).map((s, i) => {
              const c = scoreColor(s.score_pct);
              return <div key={i} title={`${s.name}: ${s.score_pct}%`} style={{ flex: 1, background: c.stroke, opacity: 0.65, transition: "opacity 0.12s", cursor: "default" }} onMouseEnter={e => (e.currentTarget.style.opacity = "1")} onMouseLeave={e => (e.currentTarget.style.opacity = "0.65")} />;
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: "#e11d48", fontWeight: 700 }}>← Weak</span>
            <span style={{ fontSize: 10, color: "#059669", fontWeight: 700 }}>Strong →</span>
          </div>
        </div>
        {/* Student rows */}
        {sim.students.map((s, i) => {
          const sc   = scoreColor(s.score_pct);
          const open = expandedIdx === i;
          return (
            <div key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
              <div onClick={() => setExpandedIdx(open ? null : i)} style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: 9, cursor: "pointer", transition: "background 0.12s", background: open ? "#f9fafb" : "transparent" }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: sc.bg, border: `1px solid ${sc.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <LuUser style={{ width: 12, height: 12, color: sc.stroke }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                <div style={{ width: 48, height: 4, background: "#f3f4f6", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ height: "100%", width: `${s.score_pct}%`, background: sc.stroke, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: sc.stroke, minWidth: 34, textAlign: "right", flexShrink: 0 }}>{s.score_pct}%</span>
                <LuChevronRight style={{ width: 11, height: 11, color: "#d1d5db", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
              </div>
              <AnimatePresence>
                {open && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "0 14px 10px 53px", display: "flex", flexDirection: "column", gap: 6 }}>
                      {firstTQ.map((q, qi) => {
                        const origIdx = questions.findIndex(oq => oq === q);
                        const chosen  = s.answers[String(origIdx)] ?? "";
                        const correct = chosen.trim() === q.answer.trim();
                        const qc      = correct ? { bg: "#f0fdf4", border: "#bbf7d0", icon: "#059669" } : { bg: "#fff1f2", border: "#fecdd3", icon: "#e11d48" };
                        return (
                          <div key={qi} style={{ background: qc.bg, borderRadius: 10, padding: "8px 11px", border: `1px solid ${qc.border}` }}>
                            <div style={{ display: "flex", gap: 6, marginBottom: 3, alignItems: "flex-start" }}>
                              {correct ? <LuCircleCheck style={{ width: 11, height: 11, color: qc.icon, flexShrink: 0, marginTop: 1 }} /> : <LuCircleX style={{ width: 11, height: 11, color: qc.icon, flexShrink: 0, marginTop: 1 }} />}
                              <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.5, margin: 0 }}>{q.question}</p>
                            </div>
                            <div style={{ fontSize: 11, color: "#6b7280", paddingLeft: 17 }}>
                              {!correct && <span>Answered: <strong style={{ color: "#e11d48" }}>{chosen || "—"}</strong> · </span>}
                              Correct: <strong style={{ color: "#059669" }}>{q.answer}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {!sim.needs_revision && (
        <div style={{ borderRadius: 14, padding: "14px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", gap: 9, alignItems: "flex-start" }}>
          <LuTrophy style={{ width: 15, height: 15, color: "#059669", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: "#065f46", lineHeight: 1.6, margin: 0 }}>{sim.remark}</p>
        </div>
      )}
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────────

export default function LessonGenerator() {
  const [stage, setStage]           = useState<"upload" | "lesson">("upload");
  const [subject, setSubject]       = useState("");
  const [topic, setTopic]           = useState("");
  const [className, setClass]       = useState("");
  const [customRule, setCustomRule] = useState("");
  const [saveRuleForFuture, setSaveRuleForFuture] = useState(false);
  const [showRuleBox, setShowRuleBox] = useState(false);
  const [showTip, setShowTip]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [lesson, setLesson]         = useState<LessonResponse | null>(null);
  const [sim, setSim]               = useState<SimulateResponse | null>(null);
  const [showSimPanel, setShowSimPanel] = useState(false);

  const topicImgs = useImageSlots();
  const pyqImgs   = useImageSlots();

  // ── Load saved rule from localStorage on mount ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_RULE_KEY);
      if (saved) {
        setCustomRule(saved);
        setSaveRuleForFuture(true);
        setShowRuleBox(true); // auto-open so user sees their saved rule
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  // ── Persist / clear rule in localStorage whenever toggle or rule changes ──
  useEffect(() => {
    try {
      if (saveRuleForFuture && customRule.trim()) {
        localStorage.setItem(SAVED_RULE_KEY, customRule);
      } else if (!saveRuleForFuture) {
        localStorage.removeItem(SAVED_RULE_KEY);
      }
    } catch { /* localStorage unavailable */ }
  }, [saveRuleForFuture, customRule]);

  const handleClearSavedRule = () => {
    setCustomRule("");
    setSaveRuleForFuture(false);
    try { localStorage.removeItem(SAVED_RULE_KEY); } catch { /* ignore */ }
  };

  const canSubmit  = !loading && (topic.trim().length > 0 || topicImgs.slots.length > 0);
  const revTopics  = new Set(sim?.weak_topics.filter(w => w.accuracy < 60).map(w => w.topic) ?? []);

  // The rule that gets sent — always uses current customRule (saved or session-only)
  const effectiveRule = customRule.trim();

  const openLesson = async (id: number) => {
    setLoading(true); setError(null);
    try {
      const [lr, rr] = await Promise.all([
        fetch(`${BASE_URL}/lesson-generator/${id}`),
        fetch(`${BASE_URL}/lesson-generator/${id}/student-record`),
      ]);
      if (!lr.ok) throw new Error(`Error ${lr.status}`);
      const data: LessonResponse = await lr.json();
      setLesson(data);
      if (rr.ok) {
        const rec = await rr.json();
        if (rec.attempt_count > 0) {
          setSim({ lesson_id: id, topic: data.topic ?? "", students: [], avg_score: rec.avg_score,
            below50_count: 0, needs_revision: rec.avg_score < 60,
            weak_topics: rec.weak_topics ?? [], remark: rec.remark ?? "" });
        }
      }
      setStage("lesson");
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!canSubmit) return;
    setLoading(true); setError(null); setSim(null);
    try {
      const fd = new FormData();
      if (subject.trim())    fd.append("subject", subject.trim());
      if (className.trim())  fd.append("class_name", className.trim());
      if (topic.trim())      fd.append("topic", topic.trim());
      if (effectiveRule)     fd.append("user_defined_rule", effectiveRule);

      topicImgs.slots.forEach((s, i) => fd.append(`topic_image_${i + 1}`, s.file));
      pyqImgs.slots.forEach((s, i)   => fd.append(`pyq_image_${i + 1}`, s.file));

      const res = await fetch(`${BASE_URL}/lesson-generator`, { method: "POST", body: fd });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Error ${res.status}`); }
      setLesson(await res.json());
      setStage("lesson");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleDemo = async () => {
    if (!lesson) return;
    setDemoLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE_URL}/lesson-generator/${lesson.id}/simulate`, { method: "POST" });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Error ${res.status}`); }
      setSim(await res.json());
      setShowSimPanel(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Simulation failed"); }
    finally { setDemoLoading(false); }
  };

  const reset = () => {
    setLesson(null); setSim(null); setError(null);
    setSubject(""); setTopic(""); setClass("");
    // Only reset rule text if not saved; keep saved rule loaded
    if (!saveRuleForFuture) setCustomRule("");
    setShowTip(false); setShowRuleBox(false); setStage("upload");
    setShowSimPanel(false);
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb",
    fontSize: 13, background: "#f9fafb", color: "#111827", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes gradMove{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes slideInUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}

        *,*::before,*::after{box-sizing:border-box;min-width:0;}
        html,body{overflow-x:hidden;max-width:100vw;}
        *{font-family:'Cabinet Grotesk','DM Sans',system-ui,sans-serif;}
        .syne{font-family:'Syne',system-ui,sans-serif!important;}

        .gen-btn{background:linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4,#6366f1);background-size:300% 300%;animation:gradMove 3s ease infinite;}
        .gen-btn:hover{opacity:0.92;}
        .demo-btn{background:linear-gradient(135deg,#059669,#10b981,#34d399,#059669);background-size:280% 280%;animation:gradMove 3.5s ease infinite;}

        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:2px;}

        html,body{overflow-x:hidden;}
        img,svg,video{max-width:100%;}

        .upload-grid{display:grid;grid-template-columns:1fr;gap:12px;}
        .form-grid{display:grid;grid-template-columns:1fr;gap:12px;}
        .lesson-grid{display:grid;grid-template-columns:1fr;gap:12px;}
        .two-col{display:grid;grid-template-columns:1fr;gap:10px;}

        .sidebar-desktop{display:none;}

        .sim-fab{
          display:flex;
          position:fixed;bottom:18px;left:50%;transform:translateX(-50%);
          z-index:50;padding:11px 20px;border-radius:50px;border:none;
          cursor:pointer;font-size:13px;font-weight:800;color:#fff;
          gap:7px;align-items:center;justify-content:center;
          box-shadow:0 6px 24px rgba(5,150,105,0.4);
          font-family:'Syne',sans-serif;
          white-space:nowrap;
          width:auto;max-width:calc(100vw - 32px);
        }

        .sim-drawer{
          display:none;
          position:fixed;inset:0;z-index:100;
          flex-direction:column;
          background:#f8fafc;
          overflow-y:auto;overflow-x:hidden;
          -webkit-overflow-scrolling:touch;
        }
        .sim-drawer.open{display:flex;animation:slideInUp 0.28s ease;}

        @media(min-width:560px){
          .upload-grid{grid-template-columns:1fr 1fr;}
          .two-col{grid-template-columns:1fr 1fr;}
        }

        @media(min-width:960px){
          .form-grid{grid-template-columns:1fr 320px;}
          .lesson-grid{grid-template-columns:1fr 370px;gap:20px;}
          .sidebar-desktop{display:flex;flex-direction:column;gap:14px;position:sticky;top:70px;min-width:0;}
          .sim-fab{display:none!important;}
          .sim-drawer{display:none!important;}
          .sim-drawer.open{display:none!important;}
        }

        .page-inner{width:100%;max-width:1100px;margin:0 auto;padding:14px 12px 100px;overflow-x:hidden;}
        @media(min-width:560px){.page-inner{padding:16px 16px 100px;}}
        @media(min-width:960px){.page-inner{padding:20px 24px 100px;}}

        .rule-active{border-color:#6366f1!important;background:#f5f3ff!important;}
      `}</style>

      <div style={{ width: "100%", maxWidth: "100vw", minHeight: "100vh", background: "#f8fafc", color: "#111827", overflowX: "hidden" }}>

        {/* ── Sticky header ── */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, height: 56, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", flexShrink: 0 }}>
                <LuBookOpen style={{ width: 18, height: 18, color: "#fff" }} />
              </div>
              <div>
                <h1 className="syne" style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.04em", color: "#111827", lineHeight: 1, margin: 0 }}>LessonAI</h1>
                <p style={{ fontSize: 9, color: "#9ca3af", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 1, fontWeight: 700 }}>Instant Lesson Planner</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {[{ n: 1, label: "Plan", active: stage === "upload" }, { n: 2, label: "Lesson", active: stage === "lesson" }].map((s, i) => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {i > 0 && <div style={{ width: 12, height: 1, background: "#e5e7eb" }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 18, background: s.active ? "#eef2ff" : "#f3f4f6", border: s.active ? "1.5px solid #c7d2fe" : "1.5px solid #e5e7eb" }}>
                    <div style={{ width: 17, height: 17, borderRadius: "50%", background: s.active ? "#6366f1" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: s.active ? "#fff" : "#9ca3af", fontWeight: 800 }}>{s.n}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.active ? "#4338ca" : "#9ca3af" }}>{s.label}</span>
                  </div>
                </div>
              ))}
              {stage === "lesson" && (
                <button onClick={reset} style={{ marginLeft: 4, padding: "5px 11px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 12, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <LuArrowLeft style={{ width: 12, height: 12 }} /> New
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Page content ── */}
        <div className="page-inner">

          {/* ── UPLOAD STAGE ── */}
          {stage === "upload" && (
            <div className="form-grid" style={{ animation: "slideUp 0.35s ease" }}>

              {/* Left col */}
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

                {/* Tip banner */}
                <div style={{ padding: "11px 13px", borderRadius: 12, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "flex-start", gap: 9 }}>
                  <LuInfo style={{ width: 15, height: 15, color: "#2563eb", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "#1e40af", lineHeight: 1.6, margin: 0 }}>
                    <strong>Tip:</strong> Add <strong>subject</strong> and <strong>class</strong> for a tailored lesson. Upload <strong>PYQ images</strong> to align with exam patterns. Use <strong>Institution Rules</strong> to enforce your university's credit-hour or timing guidelines.
                  </p>
                </div>

                {/* Form card */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ padding: "13px 15px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1" }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#111827", fontFamily: "'Syne',sans-serif" }}>Lesson Details</span>
                  </div>
                  <div style={{ padding: "14px" }}>
                    <div className="two-col" style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>Subject</label>
                          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 7, background: "#f3f4f6", color: "#9ca3af", fontWeight: 700 }}>Optional</span>
                          <button onClick={() => setShowTip(v => !v)} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 700, background: showTip ? "#eef2ff" : "#f3f4f6", color: showTip ? "#4338ca" : "#9ca3af" }}>why?</button>
                        </div>
                        <input style={inp} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>Class</label>
                          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 7, background: "#f3f4f6", color: "#9ca3af", fontWeight: 700 }}>Optional</span>
                        </div>
                        <input style={inp} value={className} onChange={e => setClass(e.target.value)} placeholder="e.g. Grade 10" />
                      </div>
                    </div>

                    <AnimatePresence>
                      {showTip && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 11 }}>
                          <div style={{ padding: "9px 12px", borderRadius: 10, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                            <p style={{ fontSize: 12, color: "#1e40af", lineHeight: 1.6, margin: 0 }}>Subject and class help the AI tailor vocabulary, complexity, and curriculum alignment.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>Topic / Syllabus</label>
                        <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 7, background: "#fef2f2", color: "#dc2626", fontWeight: 700 }}>Required if no image</span>
                      </div>
                      <textarea rows={5} style={{ ...inp, resize: "none", lineHeight: 1.6 }} value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder={"e.g. Quadratic Equations\n\nOr paste your full syllabus — AI generates one plan per topic."} />
                    </div>
                  </div>
                </div>

                {/* ── Institution Rules card ── */}
                <div style={{
                  background: "#fff", borderRadius: 18,
                  border: showRuleBox ? "1.5px solid #c7d2fe" : "1px solid #e5e7eb",
                  overflow: "hidden",
                  boxShadow: showRuleBox ? "0 2px 14px rgba(99,102,241,0.1)" : "0 1px 6px rgba(0,0,0,0.04)",
                  transition: "border-color 0.2s, box-shadow 0.2s"
                }}>
                  {/* Header — always visible, acts as toggle */}
                  <button
                    onClick={() => setShowRuleBox(v => !v)}
                    style={{ width: "100%", padding: "13px 15px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, textAlign: "left" }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: showRuleBox ? "#eef2ff" : "#f3f4f6", border: `1.5px solid ${showRuleBox ? "#c7d2fe" : "#e5e7eb"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                      <LuSchool style={{ width: 13, height: 13, color: showRuleBox ? "#6366f1" : "#9ca3af" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#111827", fontFamily: "'Syne',sans-serif" }}>Institution Rules</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 7, background: "#f3f4f6", color: "#9ca3af", fontWeight: 700 }}>Optional</span>
                        {customRule.trim() && (
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 7, background: "#eef2ff", color: "#4338ca", fontWeight: 700, border: "1px solid #c7d2fe" }}>Active</span>
                        )}
                        {saveRuleForFuture && customRule.trim() && (
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 7, background: "#f0fdf4", color: "#059669", fontWeight: 700, border: "1px solid #bbf7d0" }}>Saved</span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", lineHeight: 1.4 }}>
                        Credit hours, topic timing, university-specific guidelines
                      </p>
                    </div>
                    <LuChevronDown style={{ width: 14, height: 14, color: "#9ca3af", transform: showRuleBox ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                  </button>

                  {/* Expandable body */}
                  <AnimatePresence>
                    {showRuleBox && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "0 14px 14px" }}>
                          {/* Info callout */}
                          <div style={{ padding: "9px 12px", borderRadius: 10, background: "#f5f3ff", border: "1px solid #ddd6fe", marginBottom: 11, display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <LuInfo style={{ width: 13, height: 13, color: "#7c3aed", flexShrink: 0, marginTop: 1 }} />
                            <p style={{ fontSize: 12, color: "#5b21b6", lineHeight: 1.6, margin: 0 }}>
                              These rules are injected at the <strong>highest priority</strong> in the AI prompt — they override all defaults.
                              Use them to enforce your university's credit-hour allocations, topic sequencing, or any other institutional constraints.
                            </p>
                          </div>

                          {/* Example chips */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                            {[
                              "Follow AKU Bihar timing guidelines",
                              "Each lecture must be exactly 50 minutes",
                              "Cover practicals before theory",
                            ].map(ex => (
                              <button
                                key={ex}
                                onClick={() => setCustomRule(prev => prev ? `${prev}\n${ex}` : ex)}
                                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", cursor: "pointer", fontWeight: 600, transition: "all 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.color = "#4338ca"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
                              >
                                + {ex}
                              </button>
                            ))}
                          </div>

                          {/* Textarea */}
                          <textarea
                            rows={5}
                            className={customRule.trim() ? "rule-active" : ""}
                            style={{ ...inp, resize: "none", lineHeight: 1.6 }}
                            value={customRule}
                            onChange={e => setCustomRule(e.target.value)}
                            placeholder={`Enter your institution's rules, e.g.:\n• Follow AKU Bihar semester timing schedule\n• Practical sessions must precede theory lectures`}
                          />

                          {/* Save toggle row */}
                          <div
                            onClick={() => setSaveRuleForFuture(v => !v)}
                            style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: saveRuleForFuture ? "#f0fdf4" : "#f9fafb", border: `1px solid ${saveRuleForFuture ? "#bbf7d0" : "#e5e7eb"}`, cursor: "pointer", transition: "all 0.2s", userSelect: "none" }}
                          >
                            {/* Toggle pill */}
                            <div style={{ width: 38, height: 22, borderRadius: 11, background: saveRuleForFuture ? "#059669" : "#e5e7eb", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
                              <div style={{ position: "absolute", top: 3, left: saveRuleForFuture ? 18 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 13, fontWeight: 700, color: saveRuleForFuture ? "#065f46" : "#374151", margin: 0, marginBottom: 1 }}>
                                Save rules for all future sessions
                              </p>
                              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                                {saveRuleForFuture
                                  ? "✓ Stored locally — loaded automatically next time."
                                  : "Rules apply to this session only."}
                              </p>
                            </div>
                          </div>

                          {/* Clear saved button — only shown when saved */}
                          {saveRuleForFuture && customRule.trim() && (
                            <button
                              onClick={e => { e.stopPropagation(); handleClearSavedRule(); }}
                              style={{ width: "100%", marginTop: 8, padding: "9px 12px", borderRadius: 10, border: "1.5px solid #fecdd3", background: "#fff1f2", color: "#be123c", fontSize: 13, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 0.2s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#ffe4e6"; e.currentTarget.style.borderColor = "#fda4af"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.borderColor = "#fecdd3"; }}
                            >
                              🗑️ Clear Saved Rules
                            </button>
                          )}

                          {/* Session-only clear link */}
                          {customRule.trim() && !saveRuleForFuture && (
                            <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>
                                ✓ Rules active for this session
                              </span>
                              <button
                                onClick={() => setCustomRule("")}
                                style={{ fontSize: 11, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                              >
                                Clear
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Upload zones */}
                <div className="upload-grid">
                  <UploadSection label="Topic / Syllabus Images" hint="Upload textbook pages. AI reads and builds the plan. Up to 8 images." accent="#6366f1" slots={topicImgs.slots} onAdd={topicImgs.add} onRemove={topicImgs.remove} />
                  <UploadSection label="PYQ Images" hint="Upload past exam papers to align with real patterns. Up to 8 images." accent="#059669" slots={pyqImgs.slots} onAdd={pyqImgs.add} onRemove={pyqImgs.remove} />
                </div>

                {error && (
                  <div style={{ padding: "11px 14px", borderRadius: 12, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", fontSize: 13, fontWeight: 600 }}>
                    ✕ {error}
                  </div>
                )}

                {/* Generate button */}
                <button onClick={handleGenerate} disabled={!canSubmit}
                  className={canSubmit && !loading ? "gen-btn" : ""}
                  style={{ padding: "13px 24px", borderRadius: 13, border: "none", cursor: canSubmit ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 800, color: canSubmit ? "#fff" : "#9ca3af", background: canSubmit && !loading ? undefined : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, boxShadow: canSubmit && !loading ? "0 4px 22px rgba(99,102,241,0.38)" : "none", fontFamily: "'Syne',sans-serif", width: "100%" }}>
                  {loading
                    ? <><span style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite", flexShrink: 0 }} /> Generating lesson plan…</>
                    : <><LuSparkles style={{ width: 16, height: 16 }} /> {canSubmit ? "Generate Lesson Plan" : "Enter topic or upload images"}</>}
                </button>
              </div>

              {/* Right col — prev lessons */}
              <div>
                <PrevLessonsPanel onOpen={openLesson} />
              </div>
            </div>
          )}

          {/* ── LESSON STAGE ── */}
          {stage === "lesson" && lesson && (
            <>
              <div className="lesson-grid" style={{ animation: "slideUp 0.35s ease" }}>

                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

                  {sim?.needs_revision && sim.students.length === 0 && (
                    <div style={{ padding: "13px 15px", borderRadius: 14, background: "#fff1f2", border: "1.5px solid #fecdd3", display: "flex", gap: 11, alignItems: "flex-start", boxShadow: "0 2px 12px rgba(225,29,72,0.1)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fecdd3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <LuBellRing style={{ width: 16, height: 16, color: "#e11d48" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#e11d48", margin: "0 0 3px", fontFamily: "'Syne',sans-serif" }}>⚠ Revision Required — Avg {sim.avg_score}%</p>
                        <p style={{ fontSize: 12, color: "#be123c", lineHeight: 1.6, margin: 0 }}>This lesson had poor class performance. Review the highlighted topics below before proceeding.</p>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: "13px 16px", borderRadius: 14, background: "#fff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p className="syne" style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: "0 0 2px", letterSpacing: "-0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.topic}</p>
                      {(lesson.subject || lesson.className) && <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{[lesson.subject, lesson.className].filter(Boolean).join(" · ")}</p>}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 7, background: "#eef2ff", color: "#4338ca", fontWeight: 700, border: "1px solid #c7d2fe" }}>AI Generated</span>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{lesson.lessonContent.length} topic{lesson.lessonContent.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {lesson.lessonContent.map((c, i) => (
                    <TopicCard key={i} c={c} idx={i} revise={revTopics.has(c.topic)} />
                  ))}
                </div>

                {/* Desktop sidebar */}
                <div className="sidebar-desktop">
                  {sim?.needs_revision && sim.students.length > 0 && (
                    <div style={{ padding: "13px 15px", borderRadius: 14, background: "#fff1f2", border: "1.5px solid #fecdd3", display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fecdd3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <LuTriangleAlert style={{ width: 15, height: 15, color: "#e11d48" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#e11d48", margin: "0 0 3px", fontFamily: "'Syne',sans-serif" }}>⚠ Revision Required</p>
                        <p style={{ fontSize: 12, color: "#be123c", lineHeight: 1.6, margin: "0 0 6px" }}><strong>{sim.below50_count}/{sim.students.length}</strong> students below 50%. Avg: <strong>{sim.avg_score}%</strong></p>
                        <p style={{ fontSize: 11, color: "#881337", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>"{sim.remark}"</p>
                      </div>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {!demoLoading && !sim && (
                      <motion.div key="cta" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", padding: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <LuUsers style={{ width: 16, height: 16, color: "#059669" }} />
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: "#111827", fontFamily: "'Syne',sans-serif", margin: 0 }}>Demo Student Results</p>
                            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Simulate 22 students taking this quiz</p>
                          </div>
                        </div>
                        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 13 }}>AI simulates a realistic class so you can see who needs revision.</p>
                        <button onClick={handleDemo} className="demo-btn" style={{ width: "100%", padding: "11px", borderRadius: 11, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 4px 16px rgba(5,150,105,0.3)" }}>
                          <LuZap style={{ width: 14, height: 14 }} /> See Demo Student Results
                        </button>
                      </motion.div>
                    )}
                    {demoLoading && (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <DemoLoader />
                      </motion.div>
                    )}
                    {sim && !demoLoading && (
                      <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <SimResultsPanel sim={sim} questions={lesson.quiz} />
                        <button onClick={() => { setSim(null); handleDemo(); }} style={{ width: "100%", marginTop: 11, padding: "9px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", color: "#6366f1", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          <LuRefreshCw style={{ width: 12, height: 12 }} /> Run Again
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && !demoLoading && (
                    <div style={{ padding: "10px 13px", borderRadius: 10, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", fontSize: 12, fontWeight: 600 }}>
                      ✕ {error}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Mobile FAB ── */}
              <button
                onClick={() => { if (!sim && !demoLoading) { handleDemo(); } else { setShowSimPanel(true); } }}
                className="sim-fab demo-btn"
                style={{ background: "linear-gradient(135deg,#059669,#10b981)", backgroundSize: "280% 280%", animation: "gradMove 3.5s ease infinite" }}
              >
                {demoLoading
                  ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Simulating…</>
                  : sim
                    ? <><LuUsers style={{ width: 14, height: 14 }} /> View Results</>
                    : <><LuZap style={{ width: 14, height: 14 }} /> Demo Student Results</>
                }
              </button>

              {/* ── Mobile Sim Drawer ── */}
              <div className={`sim-drawer ${showSimPanel ? "open" : ""}`}>
                <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 10, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#111827", fontFamily: "'Syne',sans-serif" }}>
                    {sim ? "Student Results" : "Demo Simulation"}
                  </span>
                  <button onClick={() => setShowSimPanel(false)} style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LuX style={{ width: 15, height: 15, color: "#6b7280" }} />
                  </button>
                </div>
                <div style={{ padding: "16px 16px 80px", display: "flex", flexDirection: "column", gap: 13 }}>
                  {sim?.needs_revision && sim.students.length > 0 && (
                    <div style={{ padding: "13px 15px", borderRadius: 14, background: "#fff1f2", border: "1.5px solid #fecdd3", display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fecdd3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <LuTriangleAlert style={{ width: 15, height: 15, color: "#e11d48" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#e11d48", margin: "0 0 3px", fontFamily: "'Syne',sans-serif" }}>⚠ Revision Required</p>
                        <p style={{ fontSize: 12, color: "#be123c", lineHeight: 1.6, margin: "0 0 6px" }}><strong>{sim.below50_count}/{sim.students.length}</strong> below 50%. Avg: <strong>{sim.avg_score}%</strong></p>
                        <p style={{ fontSize: 11, color: "#881337", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>"{sim.remark}"</p>
                      </div>
                    </div>
                  )}
                  <AnimatePresence mode="wait">
                    {demoLoading && (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <DemoLoader />
                      </motion.div>
                    )}
                    {sim && !demoLoading && (
                      <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <SimResultsPanel sim={sim} questions={lesson.quiz} />
                        <button onClick={() => { setSim(null); setShowSimPanel(false); handleDemo(); }} style={{ width: "100%", marginTop: 11, padding: "11px", borderRadius: 11, border: "1.5px solid #e5e7eb", background: "#fff", color: "#6366f1", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <LuRefreshCw style={{ width: 13, height: 13 }} /> Run Again
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {error && !demoLoading && (
                    <div style={{ padding: "11px 13px", borderRadius: 11, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", fontSize: 13, fontWeight: 600 }}>
                      ✕ {error}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}