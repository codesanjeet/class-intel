"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type AccentColor = "blue" | "green" | "amber" | "purple" | "rose";
type RubricLevel = "Good" | "Average" | "Poor";
type RubricCreativity = "Good" | "Average" | "Poor" | "N/A";

interface Rubric {
  understanding: RubricLevel;
  clarity: RubricLevel;
  completeness: RubricLevel;
  creativity: RubricCreativity;
}

interface Question {
  id: number;
  questionText: string;
  layout: "full" | "half";
  accentColor: AccentColor;
  icon: string;
  score: number;
  scoreOutOf: number;
  rubric: Rubric;
  summary: string;
  strengths: string[];
  improvements: string[];
}

interface GradingResult {
  totalScore: number;
  totalScoreOutOf: number;
  overallSummary: string;
  overallEncouragement: string;
  questions: Question[];
}

const BASE_URL = "https://class-intel.onrender.com";
// const BASE_URL ="http://localhost:8000";
const ACCENT: Record<AccentColor, {
  stroke: string; glow: string; text: string;
  bg: string; border: string; cardBg: string; cardBorder: string;
}> = {
  green:  { stroke: "#059669", glow: "rgba(5,150,105,0.12)",  text: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.2)",  cardBg: "#f0fdf4", cardBorder: "#bbf7d0" },
  blue:   { stroke: "#2563eb", glow: "rgba(37,99,235,0.12)",  text: "#1e3a8a", bg: "rgba(37,99,235,0.08)",  border: "rgba(37,99,235,0.2)",  cardBg: "#eff6ff", cardBorder: "#bfdbfe" },
  amber:  { stroke: "#d97706", glow: "rgba(217,119,6,0.12)",  text: "#78350f", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)",  cardBg: "#fffbeb", cardBorder: "#fde68a" },
  purple: { stroke: "#7c3aed", glow: "rgba(124,58,237,0.12)", text: "#4c1d95", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)", cardBg: "#f5f3ff", cardBorder: "#ddd6fe" },
  rose:   { stroke: "#e11d48", glow: "rgba(225,29,72,0.12)",  text: "#881337", bg: "rgba(225,29,72,0.08)",  border: "rgba(225,29,72,0.2)",  cardBg: "#fff1f2", cardBorder: "#fecdd3" },
};

const VALID_ACCENTS: AccentColor[]         = ["blue","green","amber","purple","rose"];
const VALID_RUBRIC: RubricLevel[]          = ["Good","Average","Poor"];
const VALID_CREATIVITY: RubricCreativity[] = ["Good","Average","Poor"];

function getScoreColor(pct: number): AccentColor {
  if (pct >= 0.8) return "green";
  if (pct >= 0.6) return "blue";
  if (pct >= 0.4) return "amber";
  return "rose";
}

function safeParseResult(raw: unknown): GradingResult {
  const d = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const questions: Question[] = Array.isArray(d.questions)
    ? (d.questions as unknown[]).map((q: unknown, i: number) => {
        const qo = (q && typeof q === "object" ? q : {}) as Record<string, unknown>;
        const rubricRaw = (qo.rubric && typeof qo.rubric === "object" ? qo.rubric : {}) as Record<string, unknown>;
        return {
          id:           typeof qo.id === "number" ? qo.id : i + 1,
          questionText: typeof qo.questionText === "string" ? qo.questionText : `Question ${i + 1}`,
          layout:       qo.layout === "full" ? "full" : "half",
          accentColor:  VALID_ACCENTS.includes(qo.accentColor as AccentColor) ? (qo.accentColor as AccentColor) : "blue",
          icon:         typeof qo.icon === "string" ? qo.icon : "💡",
          score:        typeof qo.score === "number" ? qo.score : 0,
          scoreOutOf:   typeof qo.scoreOutOf === "number" ? qo.scoreOutOf : 10,
          rubric: {
            understanding: VALID_RUBRIC.includes(rubricRaw.understanding as RubricLevel) ? rubricRaw.understanding as RubricLevel : "Average",
            clarity:       VALID_RUBRIC.includes(rubricRaw.clarity as RubricLevel)       ? rubricRaw.clarity as RubricLevel       : "Average",
            completeness:  VALID_RUBRIC.includes(rubricRaw.completeness as RubricLevel)  ? rubricRaw.completeness as RubricLevel  : "Average",
            creativity:    VALID_CREATIVITY.includes(rubricRaw.creativity as RubricCreativity) ? rubricRaw.creativity as RubricCreativity : "N/A",
          },
          summary:      typeof qo.summary === "string" ? qo.summary : "",
          strengths:    Array.isArray(qo.strengths)    ? (qo.strengths as string[])    : ["Attempted the question"],
          improvements: Array.isArray(qo.improvements) ? (qo.improvements as string[]) : ["Review the topic"],
        };
      })
    : [];
  return {
    totalScore:           typeof d.totalScore === "number"      ? d.totalScore           : 0,
    totalScoreOutOf:      typeof d.totalScoreOutOf === "number" ? d.totalScoreOutOf      : 10,
    overallSummary:       typeof d.overallSummary === "string"  ? d.overallSummary       : "",
    overallEncouragement: typeof d.overallEncouragement === "string" ? d.overallEncouragement : "",
    questions,
  };
}

function ScoreRing({ score, outOf, size = 100, accent }: {
  score: number; outOf: number; size?: number; accent?: AccentColor;
}) {
  const pct   = outOf > 0 ? Math.min(score / outOf, 1) : 0;
  const R     = size / 2 - 8;
  const C     = 2 * Math.PI * R;
  const color = accent ?? getScoreColor(pct);
  const a     = ACCENT[color];
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", position:"absolute" }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={a.cardBorder} strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={a.stroke} strokeWidth={6}
          strokeDasharray={`${C*pct} ${C}`} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 5px ${a.glow})`, transition:"stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:size*0.24, fontWeight:800, color:a.stroke, lineHeight:1, fontFamily:"'Syne',sans-serif" }}>{score}</span>
        <span style={{ fontSize:size*0.14, color:"#9ca3af", fontWeight:600 }}>/{outOf}</span>
      </div>
    </div>
  );
}

function RubricBadge({ label, level }: { label: string; level: string }) {
  const map: Record<string,{ bg:string; text:string; dot:string }> = {
    Good:    { bg:"#dcfce7", text:"#15803d", dot:"#16a34a" },
    Average: { bg:"#fef9c3", text:"#a16207", dot:"#ca8a04" },
    Poor:    { bg:"#fee2e2", text:"#b91c1c", dot:"#dc2626" },
    "N/A":   { bg:"#f3f4f6", text:"#6b7280", dot:"#9ca3af" },
  };
  const s = map[level] ?? map["N/A"];
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", borderRadius:10, background:s.bg }}>
      <span style={{ fontSize:12, color:"#6b7280", fontWeight:600 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0 }}/>
        <span style={{ fontSize:12, fontWeight:800, color:s.text }}>{level}</span>
      </div>
    </div>
  );
}

function ImageStrip({ previews, label }: { previews: (string|null)[]; label: string }) {
  const visible = previews.filter(Boolean) as string[];
  if (!visible.length) return null;
  return (
    <div style={{ marginBottom:16 }}>
      <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#9ca3af", marginBottom:10 }}>{label}</p>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {visible.map((src, i) => (
          <div key={i} style={{ width:72, height:96, borderRadius:10, overflow:"hidden", border:"1.5px solid #e5e7eb", flexShrink:0, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <img src={src} alt={`${label} pg${i+1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ q, index, answerPreviews }: {
  q: Question; index: number; answerPreviews: (string|null)[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [showImg,  setShowImg]  = useState(false);
  const a   = ACCENT[q.accentColor];
  const pct = q.scoreOutOf > 0 ? q.score / q.scoreOutOf : 0;
  const grade = pct >= 0.8 ? "Excellent" : pct >= 0.6 ? "Good" : pct >= 0.4 ? "Fair" : "Needs Work";
  const visiblePreviews = answerPreviews.filter(Boolean) as string[];

  return (
    <div className={`q-card${q.layout === "full" ? " q-card--full" : ""}`}
      style={{ background:"#fff", border:`1.5px solid ${a.cardBorder}`, borderRadius:18, overflow:"hidden", boxShadow:`0 2px 14px ${a.glow}`, animationDelay:`${index*0.07}s` }}>
      <div style={{ height:4, background:`linear-gradient(90deg,${a.stroke},transparent)` }}/>
      <div className="card-inner">
        <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 }}>
          <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, background:a.cardBg, border:`1.5px solid ${a.cardBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
            {q.icon}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:a.stroke, fontFamily:"'Syne',sans-serif" }}>Q{q.id}</span>
              <span style={{ fontSize:12, padding:"3px 9px", borderRadius:7, background:a.cardBg, color:a.text, fontWeight:700, border:`1px solid ${a.cardBorder}` }}>{grade}</span>
              {visiblePreviews.length > 0 && (
                <button onClick={() => setShowImg(v => !v)}
                  style={{ fontSize:11, padding:"3px 9px", borderRadius:7, border:"1px solid #e5e7eb", background:"#f9fafb", color:"#6b7280", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", gap:4, marginLeft:"auto" }}>
                  🖼 {showImg ? "Hide" : "View"}
                </button>
              )}
            </div>
            <p style={{ fontSize:13, color:"#374151", lineHeight:1.65, wordBreak:"break-word", fontWeight:500 }}>{q.questionText}</p>
          </div>
          <ScoreRing score={q.score} outOf={q.scoreOutOf} size={64} accent={q.accentColor}/>
        </div>
        {showImg && visiblePreviews.length > 0 && (
          <div style={{ display:"flex", gap:8, marginBottom:14, padding:"10px 12px", background:"#f8fafc", borderRadius:12, border:"1px solid #e5e7eb", flexWrap:"wrap", animation:"fadeIn 0.25s ease" }}>
            {visiblePreviews.map((src, i) => (
              <a key={i} href={src} target="_blank" rel="noreferrer">
                <img src={src} alt={`Answer pg${i+1}`} style={{ height:110, width:"auto", maxWidth:150, objectFit:"cover", borderRadius:8, border:"1.5px solid #e5e7eb", boxShadow:"0 1px 4px rgba(0,0,0,0.08)", cursor:"zoom-in" }}/>
              </a>
            ))}
          </div>
        )}
        <div style={{ height:4, borderRadius:99, background:a.cardBg, marginBottom:12, overflow:"hidden", border:`1px solid ${a.cardBorder}` }}>
          <div style={{ height:"100%", width:`${pct*100}%`, background:a.stroke, borderRadius:99, transition:"width 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}/>
        </div>
        <p style={{ fontSize:13, color:"#4b5563", lineHeight:1.8, marginBottom:12 }}>{q.summary}</p>
        <div className="rubric-grid" style={{ marginBottom:12 }}>
          <RubricBadge label="Understanding" level={q.rubric.understanding}/>
          <RubricBadge label="Clarity"       level={q.rubric.clarity}/>
          <RubricBadge label="Completeness"  level={q.rubric.completeness}/>
          <RubricBadge label="Creativity"    level={q.rubric.creativity}/>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          style={{ width:"100%", padding:"9px", borderRadius:10, border:"1px solid #e5e7eb", background:"#f9fafb", color:"#6b7280", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, fontWeight:700 }}>
          {expanded ? "▲ Hide Details" : "▼ Strengths & Improvements"}
        </button>
        {expanded && (
          <div className="strengths-grid" style={{ marginTop:12, animation:"fadeIn 0.3s ease" }}>
            <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:14 }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:"#15803d", marginBottom:10 }}>✦ Strengths</p>
              {q.strengths.map((s,i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:7, alignItems:"flex-start" }}>
                  <span style={{ color:"#16a34a", fontSize:8, marginTop:5, flexShrink:0 }}>●</span>
                  <span style={{ fontSize:13, color:"#166534", lineHeight:1.65 }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:14 }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:"#a16207", marginBottom:10 }}>▲ To Improve</p>
              {q.improvements.map((s,i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:7, alignItems:"flex-start" }}>
                  <span style={{ color:"#ca8a04", fontSize:8, marginTop:5, flexShrink:0 }}>●</span>
                  <span style={{ fontSize:13, color:"#713f12", lineHeight:1.65 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadSection({ label, hint, accent, previews, onAdd, onRemove, maxFiles = 4, required = false, missing = false }: {
  label: string; hint: string; accent: string; maxFiles?: number;
  previews: (string|null)[]; onAdd: (f:File) => void; onRemove: (i:number) => void;
  required?: boolean; missing?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/")).forEach(onAdd);
  }, [onAdd]);
  const hasImages = previews.some(Boolean);
  const count     = previews.filter(Boolean).length;
  const borderColor = missing ? "#dc2626" : dragging ? accent : "#e5e7eb";

  return (
    <div style={{ background:"#fff", borderRadius:18, border:`1.5px solid ${missing ? "#fecdd3" : "#e5e7eb"}`, overflow:"hidden", boxShadow: missing ? "0 0 0 3px rgba(220,38,38,0.08)" : "0 1px 6px rgba(0,0,0,0.04)", transition:"all 0.2s" }}>
      <div style={{ padding:"14px 16px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, minWidth:0 }}>
          <div style={{ width:9, height:9, borderRadius:"50%", background:missing?"#dc2626":accent, flexShrink:0 }}/>
          <span style={{ fontSize:14, fontWeight:800, color:"#111827", fontFamily:"'Syne',sans-serif" }}>{label}</span>
          {!required && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:7, background:"#f3f4f6", color:"#9ca3af", fontWeight:700 }}>Optional</span>}
          {required  && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:7, background: missing?"#fef2f2":"#fef2f2", color:"#dc2626", fontWeight:700 }}>Required</span>}
        </div>
        {count > 0 && <span style={{ fontSize:12, color:"#9ca3af", fontWeight:600, flexShrink:0 }}>{count}/{maxFiles}</span>}
      </div>
      {missing && (
        <div style={{ padding:"8px 14px", background:"#fef2f2", borderBottom:"1px solid #fecdd3" }}>
          <p style={{ fontSize:12, color:"#dc2626", fontWeight:600 }}>⚠ Please upload at least one image to continue</p>
        </div>
      )}
      <div style={{ padding:14 }}>
        <p style={{ fontSize:13, color:"#6b7280", marginBottom:12, lineHeight:1.6 }}>{hint}</p>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !hasImages && inputRef.current?.click()}
          style={{ borderRadius:12, border: `2px ${hasImages?"solid":"dashed"} ${borderColor}`, background: dragging ? "rgba(99,102,241,0.03)" : "#fafafa", padding: hasImages ? 10 : "26px 14px", cursor: hasImages ? "default" : "pointer", transition:"all 0.2s" }}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => { Array.from(e.target.files??[]).forEach(onAdd); e.target.value=""; }}/>
          {!hasImages ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:34, marginBottom:8 }}>{required ? "📝" : "📋"}</div>
              <p style={{ fontSize:14, fontWeight:700, color:"#374151", marginBottom:4 }}>Drop images here</p>
              <p style={{ fontSize:12, color:"#9ca3af" }}>or click to browse · up to {maxFiles} pages</p>
            </div>
          ) : (
            <div className="thumb-grid">
              {previews.map((preview, i) => preview ? (
                <div key={i} style={{ position:"relative", aspectRatio:"3/4", borderRadius:9, overflow:"hidden", border:"1.5px solid #e5e7eb" }}>
                  <img src={preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  <button onClick={e => { e.stopPropagation(); onRemove(i); }} style={{ position:"absolute", top:3, right:3, width:21, height:21, borderRadius:5, background:"rgba(0,0,0,0.65)", border:"none", color:"#fff", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                  <div style={{ position:"absolute", bottom:3, left:5, fontSize:9, color:"#fff", background:"rgba(0,0,0,0.45)", borderRadius:3, padding:"1px 5px", fontWeight:700 }}>pg {i+1}</div>
                </div>
              ) : null)}
              {count < maxFiles && (
                <div onClick={() => inputRef.current?.click()} style={{ aspectRatio:"3/4", borderRadius:9, border:"1.5px dashed #e5e7eb", background:"#f9fafb", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexDirection:"column", gap:3 }}>
                  <span style={{ fontSize:22, color:"#d1d5db" }}>+</span>
                  <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>add</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomRulesPanel({ value, onChange, saveForFuture, onSaveToggle, onClearSaved }: {
  value: string;
  onChange: (v: string) => void;
  saveForFuture: boolean;
  onSaveToggle: () => void;
  onClearSaved: () => void;
}) {
  const [open, setOpen] = useState(!!value);
  const hasSavedRules = saveForFuture && value.trim();

  return (
    <div style={{ background:"#fff", borderRadius:18, border:"1px solid #e5e7eb", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:"100%", padding:"14px 16px", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:9, height:9, borderRadius:"50%", background: value.trim() ? "#7c3aed" : "#d1d5db", flexShrink:0, transition:"background 0.2s" }}/>
          <span style={{ fontSize:14, fontWeight:800, color:"#111827", fontFamily:"'Syne',sans-serif" }}>Custom Grading Rules</span>
          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:7, background:"#f5f3ff", color:"#7c3aed", fontWeight:700 }}>Optional</span>
          {value.trim() && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:7, background:"#7c3aed", color:"#fff", fontWeight:700 }}>Active</span>}
        </div>
        <span style={{ fontSize:12, color:"#9ca3af", fontWeight:700, flexShrink:0 }}>{open ? "▲ Hide" : "▼ Add Rules"}</span>
      </button>

      {open && (
        <div style={{ padding:"0 14px 14px", borderTop:"1px solid #f3f4f6", animation:"fadeIn 0.2s ease" }}>
          <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.65, margin:"12px 0 10px" }}>
            Write any additional instructions for the AI evaluator. These will override default grading behaviour and take <strong>highest priority</strong>.
          </p>
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={"Examples:\n• Deduct 1 mark for every spelling mistake\n• Award full marks if the student shows working\n• Ignore grammar and judge only scientific accuracy\n• This is a creative writing exam — creativity weighs 50%"}
            rows={6}
            style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"1.5px solid #ddd6fe", background:"#faf5ff", fontSize:13, color:"#374151", lineHeight:1.7, resize:"vertical", outline:"none", fontFamily:"inherit", transition:"border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#7c3aed"}
            onBlur={e  => e.target.style.borderColor = "#ddd6fe"}
          />

          <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background: saveForFuture ? "#f5f3ff" : "#f9fafb", border:`1px solid ${saveForFuture ? "#ddd6fe" : "#e5e7eb"}`, cursor:"pointer", transition:"all 0.2s" }}
            onClick={onSaveToggle}
          >
            <div style={{ width:38, height:22, borderRadius:11, background: saveForFuture ? "#7c3aed" : "#e5e7eb", position:"relative", flexShrink:0, transition:"background 0.2s" }}>
              <div style={{ position:"absolute", top:3, left: saveForFuture ? 18 : 3, width:16, height:16, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.2)", transition:"left 0.2s" }}/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:700, color: saveForFuture ? "#5b21b6" : "#374151", marginBottom:1 }}>
                Save rules for all future grading sessions
              </p>
              <p style={{ fontSize:11, color:"#9ca3af" }}>
                {saveForFuture ? "These rules will be loaded automatically next time." : "Rules apply to this session only."}
              </p>
            </div>
          </div>

          {hasSavedRules && (
            <button
              onClick={(e) => { e.stopPropagation(); onClearSaved(); }}
              style={{ width:"100%", marginTop:10, padding:"9px 12px", borderRadius:10, border:"1.5px solid #fecdd3", background:"#fff1f2", color:"#be123c", fontSize:13, cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ffe4e6"; e.currentTarget.style.borderColor = "#fda4af"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.borderColor = "#fecdd3"; }}
            >
              🗑️ Clear Saved Rules
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function GradingPanel() {
  const [maxMark, setMaxMark]     = useState<number>(10);
  const [customRules, setCustomRules] = useState("");
  const [saveForFuture, setSaveForFuture] = useState(false);

  const [qImages,   setQImages]   = useState<(File|null)[]>([null,null,null,null]);
  const [qPreviews, setQPreviews] = useState<(string|null)[]>([null,null,null,null]);
  const [aImages,   setAImages]   = useState<(File|null)[]>([null,null,null,null]);
  const [aPreviews, setAPreviews] = useState<(string|null)[]>([null,null,null,null]);

  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState<GradingResult|null>(null);
  const [error,   setError]     = useState<string|null>(null);
  const [stage,   setStage]     = useState<"upload"|"results">("upload");
  const [savedAPreviews, setSavedAPreviews] = useState<(string|null)[]>([]);
  const [savedQPreviews, setSavedQPreviews] = useState<(string|null)[]>([]);
  const [showQMissing, setShowQMissing] = useState(false);
  const [showAMissing, setShowAMissing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gradeai_custom_rules');
    if (saved) {
      setCustomRules(saved);
      setSaveForFuture(true);
    }
  }, []);

  const addToSlots = (
    setFiles: React.Dispatch<React.SetStateAction<(File|null)[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<(string|null)[]>>,
    file: File,
  ) => {
    setFiles(prev => { const idx = prev.findIndex(x => !x); if (idx===-1) return prev; const n=[...prev]; n[idx]=file; return n; });
    setPreviews(prev => { const idx = prev.findIndex(x => !x); if (idx===-1) return prev; const n=[...prev]; n[idx]=URL.createObjectURL(file); return n; });
  };

  const removeFromSlots = (
    setFiles: React.Dispatch<React.SetStateAction<(File|null)[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<(string|null)[]>>,
    idx: number,
  ) => {
    setFiles(prev => { const n=[...prev]; n[idx]=null; return n; });
    setPreviews(prev => { const n=[...prev]; if(n[idx]) URL.revokeObjectURL(n[idx]!); n[idx]=null; return n; });
  };

  const handleClearSavedRules = () => {
    localStorage.removeItem('gradeai_custom_rules');
    setCustomRules("");
    setSaveForFuture(false);
  };

  const answerCount   = aImages.filter(Boolean).length;
  const questionCount = qImages.filter(Boolean).length;

  const handleSubmit = async () => {
    const qMissing = questionCount === 0;
    const aMissing = answerCount === 0;
    setShowQMissing(qMissing);
    setShowAMissing(aMissing);
    if (qMissing || aMissing) return;

    if (saveForFuture && customRules.trim()) {
      localStorage.setItem('gradeai_custom_rules', customRules.trim());
    } else if (!saveForFuture) {
      localStorage.removeItem('gradeai_custom_rules');
    }

    setLoading(true); setError(null);
    setSavedAPreviews([...aPreviews]); setSavedQPreviews([...qPreviews]);
    try {
      const formData = new FormData();
      formData.append("marks", String(maxMark));
      if (customRules.trim()) formData.append("text", customRules.trim());

      ["image1","image2","image3","image4"].forEach((s,i) => {
        if (aImages[i]) formData.append(s, aImages[i]!);
      });
      ["qimage1","qimage2","qimage3","qimage4"].forEach((s,i) => {
        if (qImages[i]) formData.append(s, qImages[i]!);
      });

      const res = await fetch(`${BASE_URL}/grading`, { method:"POST", body:formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? `Server error: ${res.status}`);
      }
      setResult(safeParseResult(await res.json()));
      setStage("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  const reset = () => {
    setResult(null); setError(null); setStage("upload");
    setQImages([null,null,null,null]); setQPreviews([null,null,null,null]);
    setAImages([null,null,null,null]); setAPreviews([null,null,null,null]);
    setSavedAPreviews([]); setSavedQPreviews([]);
    setShowQMissing(false); setShowAMissing(false);
  };

  const totalPct   = result ? (result.totalScoreOutOf > 0 ? result.totalScore / result.totalScoreOutOf : 0) : 0;
  const totalColor = ACCENT[getScoreColor(totalPct)];
  const grade      = totalPct >= 0.8 ? "Excellent" : totalPct >= 0.6 ? "Good" : totalPct >= 0.4 ? "Average" : "Below Average";
  const canSubmit  = !loading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap');

        @keyframes spin     { to { transform:rotate(360deg); } }
        @keyframes slideUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }

        *, *::before, *::after { box-sizing:border-box; }
        * { font-family:'Cabinet Grotesk','DM Sans',system-ui,sans-serif; word-break:break-word; }
        .syne { font-family:'Syne',system-ui,sans-serif !important; }

        .grade-btn { background:linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4,#6366f1); background-size:300% 300%; animation:gradMove 3s ease infinite; }
        .grade-btn:hover { opacity:0.92; }
        .mark-chip:hover { background:#ede9fe !important; border-color:#a78bfa !important; color:#5b21b6 !important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:2px; }
        .missing-shake { animation:shake 0.4s ease; }

        .q-card { animation:slideUp 0.45s ease both; }
        .q-card--full { grid-column:1 / -1; }
        .card-inner { padding:16px 14px; }
        @media (min-width:480px) { .card-inner { padding:20px 20px; } }
        .q-cards-grid { display:grid; grid-template-columns:1fr; gap:14px; }
        @media (min-width:600px) { .q-cards-grid { grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); } }
        .rubric-grid { display:grid; grid-template-columns:1fr; gap:6px; }
        @media (min-width:400px) { .rubric-grid { grid-template-columns:1fr 1fr; } }
        .strengths-grid { display:grid; grid-template-columns:1fr; gap:10px; }
        @media (min-width:480px) { .strengths-grid { grid-template-columns:1fr 1fr; } }
        .thumb-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
        @media (min-width:380px) { .thumb-grid { grid-template-columns:repeat(3,1fr); } }
        @media (min-width:520px) { .thumb-grid { grid-template-columns:repeat(4,1fr); } }
        .upload-sections { display:grid; grid-template-columns:1fr; gap:14px; }
        @media (min-width:640px) { .upload-sections { grid-template-columns:1fr 1fr; } }
        .app-header { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; padding:12px 14px; }
        @media (min-width:520px) { .app-header { padding:14px 24px; } }
        @media (max-width:400px) { .brand-sub { display:none; } }
        .step-label { display:none; }
        @media (min-width:440px) { .step-label { display:inline; } }
        .hero-score { display:flex; align-items:center; gap:24px; flex-wrap:wrap; }
        @media (max-width:460px) {
          .hero-score { flex-direction:column; align-items:center; text-align:center; }
          .hero-score-info { align-items:center !important; }
        }
        .marks-row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
        .mark-chips { display:flex; gap:6px; flex-wrap:wrap; flex:1; min-width:0; }
        .grade-btn-outer { flex-shrink:0; }
        @media (max-width:480px) { .grade-btn-outer { width:100%; } .grade-btn-outer button { width:100%; justify-content:center; } }
        .page-content { max-width:980px; margin:0 auto; padding:16px 12px 80px; }
        @media (min-width:520px) { .page-content { padding:22px 20px 80px; } }
        @media (min-width:768px) { .page-content { padding:26px 28px 80px; } }
        .graded-from-row { display:flex; gap:24px; flex-wrap:wrap; }
      `}</style>

      <div style={{ width:"100%", minHeight:"100vh", background:"#f8fafc", color:"#111827" }}>

        <div className="app-header" style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", position:"sticky", top:0, zIndex:10, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:11 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 4px 14px rgba(99,102,241,0.35)", flexShrink:0 }}>⚡</div>
            <div>
              <h1 className="syne" style={{ fontSize:19, fontWeight:800, letterSpacing:"-0.04em", color:"#111827", lineHeight:1 }}>GradeAI</h1>
              <p className="brand-sub" style={{ fontSize:10, color:"#9ca3af", letterSpacing:"0.12em", textTransform:"uppercase", marginTop:3, fontWeight:700 }}>Instant AI Evaluation</p>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            {[{n:1,label:"Upload",active:stage==="upload"},{n:2,label:"Results",active:stage==="results"}].map((s,i) => (
              <div key={s.n} style={{ display:"flex", alignItems:"center", gap:6 }}>
                {i > 0 && <div style={{ width:16, height:1, background:"#e5e7eb" }}/>}
                <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 11px", borderRadius:20, background:s.active?"#eef2ff":"#f3f4f6", border:s.active?"1.5px solid #c7d2fe":"1.5px solid #e5e7eb" }}>
                  <div style={{ width:19, height:19, borderRadius:"50%", background:s.active?"#6366f1":"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:s.active?"#fff":"#9ca3af", fontWeight:800, flexShrink:0 }}>{s.n}</div>
                  <span className="step-label" style={{ fontSize:12, fontWeight:700, color:s.active?"#4338ca":"#9ca3af" }}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {stage === "results" && (
            <button onClick={reset} style={{ padding:"7px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#fff", color:"#374151", fontSize:13, cursor:"pointer", fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>
              ← New
            </button>
          )}
        </div>

        <div className="page-content">

          {stage === "upload" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"slideUp 0.35s ease" }}>

              <div style={{ padding:"12px 14px", borderRadius:13, background:"#eff6ff", border:"1px solid #bfdbfe", display:"flex", alignItems:"flex-start", gap:10 }}>
                <span style={{ fontSize:17, flexShrink:0 }}>📋</span>
                <p style={{ fontSize:13, color:"#1e40af", lineHeight:1.65 }}>
                  Both <strong>Question Paper</strong> and <strong>Answer Sheet</strong> are required. You can upload up to <strong>4 pages</strong> each. Marks per question are set by the <em>Total Marks</em> field below.
                </p>
              </div>

              <div className="upload-sections">
                <UploadSection
                  label="Question Paper"
                  hint="Upload the exam paper so the AI knows exactly what was asked."
                  accent="#6366f1"
                  previews={qPreviews}
                  onAdd={f => { addToSlots(setQImages, setQPreviews, f); setShowQMissing(false); }}
                  onRemove={i => removeFromSlots(setQImages, setQPreviews, i)}
                  maxFiles={4}
                  required={true}
                  missing={showQMissing}
                />
                <UploadSection
                  label="Answer Sheet"
                  hint="Upload the student's written answer sheet. Multiple pages supported."
                  accent="#059669"
                  previews={aPreviews}
                  onAdd={f => { addToSlots(setAImages, setAPreviews, f); setShowAMissing(false); }}
                  onRemove={i => removeFromSlots(setAImages, setAPreviews, i)}
                  maxFiles={4}
                  required={true}
                  missing={showAMissing}
                />
              </div>

              <CustomRulesPanel
                value={customRules}
                onChange={setCustomRules}
                saveForFuture={saveForFuture}
                onSaveToggle={() => setSaveForFuture(v => !v)}
                onClearSaved={handleClearSavedRules}
              />

              <div style={{ background:"#fff", borderRadius:18, border:"1px solid #e5e7eb", padding:"16px 16px", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:"#9ca3af", marginBottom:4 }}>Marks Per Question</p>
                <p style={{ fontSize:12, color:"#6b7280", marginBottom:11 }}>Each question in the paper will be graded out of this value.</p>
                <div className="marks-row">
                  <div className="mark-chips">
                    {[2,5,10,20,25,50,100].map(m => (
                      <button key={m} className="mark-chip" onClick={() => setMaxMark(m)}
                        style={{ padding:"7px 12px", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.15s", border:maxMark===m?"1.5px solid #6366f1":"1.5px solid #e5e7eb", background:maxMark===m?"#eef2ff":"#f9fafb", color:maxMark===m?"#4338ca":"#6b7280" }}>
                        {m}
                      </button>
                    ))}
                    <input type="number" min={1} max={1000} value={maxMark}
                      onChange={e => setMaxMark(Math.max(1, Number(e.target.value)))}
                      style={{ width:68, padding:"7px 9px", borderRadius:9, fontSize:13, textAlign:"center", border:"1.5px solid #e5e7eb", background:"#f9fafb", color:"#374151", outline:"none", fontWeight:600 }}/>
                  </div>
                  <div className="grade-btn-outer">
                    <button onClick={handleSubmit} disabled={!canSubmit}
                      className={canSubmit && !loading ? "grade-btn" : ""}
                      style={{ padding:"12px 24px", borderRadius:13, border:"none", cursor:canSubmit?"pointer":"not-allowed", fontSize:14, fontWeight:800, color:canSubmit?"#fff":"#9ca3af", background:canSubmit&&!loading?undefined:"#f3f4f6", display:"flex", alignItems:"center", gap:9, whiteSpace:"nowrap", boxShadow:canSubmit&&!loading?"0 4px 22px rgba(99,102,241,0.38)":"none", fontFamily:"'Syne',sans-serif" }}>
                      {loading
                        ? <><span style={{ width:16, height:16, border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite", flexShrink:0 }}/> Analysing…</>
                        : <>⚡ Grade {questionCount}Q · {answerCount} Sheet{answerCount!==1?"s":""} · {maxMark}M</>}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ padding:"12px 16px", borderRadius:12, background:"#fff1f2", border:"1px solid #fecdd3", color:"#be123c", fontSize:13, fontWeight:600 }}>
                  ✕ {error}
                </div>
              )}
            </div>
          )}

          {stage === "results" && result && (
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"slideUp 0.35s ease" }}>

              <div className="hero-score" style={{ borderRadius:20, padding:"20px 20px", background:"#fff", border:`1.5px solid ${totalColor.cardBorder}`, boxShadow:`0 4px 28px ${totalColor.glow}` }}>
                <ScoreRing score={result.totalScore} outOf={result.totalScoreOutOf} size={108}/>
                <div className="hero-score-info" style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
                  <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#9ca3af", marginBottom:5, fontWeight:700 }}>Overall Result</p>
                  <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:6 }}>
                    <span className="syne" style={{ fontSize:50, fontWeight:800, color:totalColor.stroke, letterSpacing:"-0.04em", lineHeight:1 }}>{Math.round(totalPct*100)}</span>
                    <span style={{ fontSize:22, color:"#d1d5db", fontWeight:700 }}>%</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                    <span className="syne" style={{ fontSize:14, fontWeight:800, color:totalColor.text, background:totalColor.cardBg, padding:"4px 12px", borderRadius:9, border:`1px solid ${totalColor.cardBorder}` }}>{grade}</span>
                    <span style={{ fontSize:13, color:"#9ca3af", fontWeight:600 }}>{result.totalScore}/{result.totalScoreOutOf} marks · {result.questions.length}Q</span>
                  </div>
                  <div style={{ display:"flex", gap:4, width:"100%", maxWidth:280 }}>
                    {result.questions.map(q => {
                      const p = q.scoreOutOf > 0 ? q.score/q.scoreOutOf : 0;
                      const c = ACCENT[q.accentColor];
                      return <div key={q.id} style={{ flex:1, height:5, borderRadius:99, background:c.cardBg, overflow:"hidden", border:`1px solid ${c.cardBorder}` }}><div style={{ width:`${p*100}%`, height:"100%", background:c.stroke, borderRadius:99 }}/></div>;
                    })}
                  </div>
                </div>
              </div>

              {(savedQPreviews.some(Boolean) || savedAPreviews.some(Boolean)) && (
                <div style={{ background:"#fff", borderRadius:18, border:"1px solid #e5e7eb", padding:"16px 18px", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:"#9ca3af", marginBottom:14 }}>Graded From</p>
                  <div className="graded-from-row">
                    {savedQPreviews.some(Boolean) && <ImageStrip previews={savedQPreviews} label="Question Paper"/>}
                    {savedAPreviews.some(Boolean) && <ImageStrip previews={savedAPreviews} label="Answer Sheet"/>}
                  </div>
                </div>
              )}

              {result.overallSummary && (
                <div style={{ borderRadius:18, padding:"18px 18px", background:"#fff", border:"1px solid #e5e7eb", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:"#9ca3af", marginBottom:10, fontWeight:800 }}>Summary</p>
                  <p style={{ fontSize:14, lineHeight:1.85, color:"#374151" }}>{result.overallSummary}</p>
                </div>
              )}

              {result.questions.length > 0 && (
                <div className="q-cards-grid">
                  {result.questions.map((q, i) => (
                    <QuestionCard key={q.id} q={q} index={i} answerPreviews={savedAPreviews}/>
                  ))}
                </div>
              )}

              {result.overallEncouragement && (
                <div style={{ borderRadius:18, padding:"20px 20px", textAlign:"center", background:"#faf5ff", border:"1px solid #e9d5ff" }}>
                  <span style={{ fontSize:28, display:"block", marginBottom:10 }}>✨</span>
                  <p style={{ fontSize:15, lineHeight:1.9, color:"#6b21a8", fontStyle:"italic" }}>"{result.overallEncouragement}"</p>
                </div>
              )}

              <button onClick={reset} style={{ padding:"13px", borderRadius:13, border:"1.5px solid #e5e7eb", background:"#fff", color:"#374151", fontSize:14, fontWeight:700, cursor:"pointer", width:"100%" }}>
                ← Grade Another Sheet
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
