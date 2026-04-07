"use client";

import { useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import {
  RiSparklingFill, RiCloseLine, RiBrainLine, RiAlertLine,
  RiTrophyLine, RiUserLine, RiTeamLine, RiBarChartLine, RiCalendarLine,
  RiSearchLine, RiArrowUpLine, RiArrowDownLine, RiArrowRightLine,
  RiBookLine, RiLightbulbLine, RiShieldLine, RiGraduationCapLine,
  RiCheckboxCircleLine, RiLineChartLine, RiCompassLine, RiStarFill,
  RiMenuLine, RiDashboardLine, RiGroupLine,
} from "react-icons/ri";

type Activity = "High" | "Medium" | "Low";
type RiskLevel = "low" | "medium" | "high";
type Trend = "improving" | "stable" | "declining";

interface Student {
  id: string; name: string; score: number; attendance: number;
  activity: Activity; tests: number[]; submissions: number; rank: number;
}
interface ClassData {
  id: string; name: string; subject: string; teacher: string;
  totalStudents: number; avgScore: number; avgAttendance: number;
  topTopic: string; weakTopic: string; color: string; icon: string;
  students: Student[];
  monthlyTrend: { month: string; score: number }[];
  topicScores: { topic: string; score: number }[];
}
interface StudentInsight {
  type: "student"; summary: string;
  strengths: string[]; weaknesses: string[]; areasToImprove: string[];
  performancePrediction: { nextMonthScore: number; trend: Trend; confidence: string; explanation: string };
  actionItems: { priority: string; action: string }[];
  riskLevel: RiskLevel; riskReason: string;
  learningStyle: string; recommendedResources: string[];
}
interface ClassInsight {
  type: "class"; summary: string;
  topPerformers: string[]; atRiskStudents: string[];
  classStrengths: string[]; classWeaknesses: string[];
  topicAnalysis: { strongTopics: string[]; weakTopics: string[]; recommendedFocus: string };
  performancePrediction: { nextMonthAvg: number; trend: Trend; confidence: string; explanation: string };
  actionItems: { priority: string; action: string; targetGroup: string }[];
  attendanceInsight: string; engagementInsight: string;
  recommendedStrategies: string[];
}

// const BASE_URL = "http://localhost:8000";
const BASE_URL = "https://class-intel.onrender.com";
const CLASSES: ClassData[] = [
  {
    id: "cls_10a", name: "Class 10-A", subject: "Mathematics", teacher: "Mrs. Sharma",
    totalStudents: 28, avgScore: 6.4, avgAttendance: 74, topTopic: "Algebra", weakTopic: "Trigonometry",
    color: "#2563eb", icon: "∑",
    students: [
      { id:"s001", name:"Rahul Verma",   score:8.2, attendance:88, activity:"High",   tests:[7,8,9,8,9], submissions:18, rank:2  },
      { id:"s002", name:"Priya Singh",   score:4.1, attendance:58, activity:"Low",    tests:[5,4,3,4,5], submissions:10, rank:22 },
      { id:"s003", name:"Aman Gupta",    score:5.5, attendance:71, activity:"Medium", tests:[5,6,5,6,6], submissions:14, rank:14 },
      { id:"s004", name:"Neha Tiwari",   score:9.0, attendance:95, activity:"High",   tests:[9,9,9,8,9], submissions:20, rank:1  },
      { id:"s005", name:"Vivek Joshi",   score:3.8, attendance:52, activity:"Low",    tests:[4,3,4,4,3], submissions:8,  rank:26 },
      { id:"s006", name:"Ankita Rao",    score:7.1, attendance:82, activity:"High",   tests:[7,7,8,7,6], submissions:17, rank:6  },
      { id:"s007", name:"Rohit Kumar",   score:6.0, attendance:68, activity:"Medium", tests:[6,6,5,7,6], submissions:13, rank:12 },
      { id:"s008", name:"Simran Kaur",   score:7.8, attendance:90, activity:"High",   tests:[8,7,8,8,8], submissions:19, rank:4  },
      { id:"s009", name:"Deepak Nair",   score:5.2, attendance:65, activity:"Medium", tests:[5,5,5,6,5], submissions:12, rank:16 },
      { id:"s010", name:"Kavya Menon",   score:6.9, attendance:77, activity:"Medium", tests:[7,7,6,7,7], submissions:15, rank:8  },
      { id:"s011", name:"Arjun Patel",   score:4.5, attendance:60, activity:"Low",    tests:[4,5,4,5,4], submissions:11, rank:20 },
      { id:"s012", name:"Meera Iyer",    score:8.5, attendance:92, activity:"High",   tests:[9,8,9,8,8], submissions:19, rank:3  },
      { id:"s013", name:"Suresh Bhat",   score:3.2, attendance:44, activity:"Low",    tests:[3,3,4,3,3], submissions:6,  rank:28 },
      { id:"s014", name:"Pooja Desai",   score:7.4, attendance:85, activity:"High",   tests:[7,8,7,7,8], submissions:18, rank:5  },
      { id:"s015", name:"Karan Shah",    score:6.2, attendance:72, activity:"Medium", tests:[6,6,7,6,6], submissions:14, rank:11 },
      { id:"s016", name:"Tanya Mishra",  score:5.8, attendance:68, activity:"Medium", tests:[6,5,6,6,6], submissions:13, rank:13 },
      { id:"s017", name:"Siddharth Roy", score:7.0, attendance:80, activity:"High",   tests:[7,7,7,7,7], submissions:16, rank:7  },
      { id:"s018", name:"Lakshmi Varma", score:4.8, attendance:62, activity:"Low",    tests:[5,4,5,5,5], submissions:11, rank:19 },
    ],
    monthlyTrend:[{month:"Jan",score:5.2},{month:"Feb",score:5.8},{month:"Mar",score:6.0},{month:"Apr",score:6.1},{month:"May",score:6.4},{month:"Jun",score:6.8}],
    topicScores:[{topic:"Algebra",score:72},{topic:"Geometry",score:65},{topic:"Trig",score:48},{topic:"Stats",score:70},{topic:"Calc",score:60}],
  },
  {
    id: "cls_10b", name: "Class 10-B", subject: "Science", teacher: "Mr. Pandey",
    totalStudents: 25, avgScore: 7.1, avgAttendance: 80, topTopic: "Physics", weakTopic: "Organic Chem",
    color: "#0891b2", icon: "⚗",
    students: [
      { id:"s101", name:"Akash Malhotra",  score:8.8, attendance:94, activity:"High",   tests:[9,9,8,9,9],  submissions:20, rank:1  },
      { id:"s102", name:"Diya Kapoor",     score:7.5, attendance:86, activity:"High",   tests:[7,8,7,8,7],  submissions:18, rank:4  },
      { id:"s103", name:"Harish Reddy",    score:5.0, attendance:61, activity:"Medium", tests:[5,5,5,5,5],  submissions:12, rank:19 },
      { id:"s104", name:"Jincy Thomas",    score:9.2, attendance:97, activity:"High",   tests:[9,9,9,9,10], submissions:20, rank:1  },
      { id:"s105", name:"Karthik Nair",    score:6.3, attendance:73, activity:"Medium", tests:[6,6,7,6,6],  submissions:14, rank:11 },
      { id:"s106", name:"Lalita Sharma",   score:4.4, attendance:55, activity:"Low",    tests:[4,5,4,4,5],  submissions:10, rank:22 },
      { id:"s107", name:"Mohan Pillai",    score:7.0, attendance:82, activity:"High",   tests:[7,7,7,7,7],  submissions:16, rank:7  },
      { id:"s108", name:"Nandita Rao",     score:8.1, attendance:90, activity:"High",   tests:[8,8,8,8,8],  submissions:19, rank:3  },
      { id:"s109", name:"Om Prakash",      score:3.7, attendance:49, activity:"Low",    tests:[4,3,4,4,3],  submissions:7,  rank:25 },
      { id:"s110", name:"Pallavi Joshi",   score:6.8, attendance:78, activity:"Medium", tests:[7,7,6,7,7],  submissions:15, rank:9  },
      { id:"s111", name:"Qasim Ansari",    score:5.5, attendance:67, activity:"Medium", tests:[5,6,5,6,6],  submissions:13, rank:15 },
      { id:"s112", name:"Rashmi Verma",    score:7.9, attendance:89, activity:"High",   tests:[8,8,8,7,8],  submissions:18, rank:4  },
      { id:"s113", name:"Sanjay Dubey",    score:4.8, attendance:60, activity:"Low",    tests:[5,5,4,5,5],  submissions:11, rank:20 },
      { id:"s114", name:"Tanvi Mehra",     score:6.5, attendance:76, activity:"Medium", tests:[6,7,6,7,6],  submissions:14, rank:10 },
      { id:"s115", name:"Uday Bose",       score:7.3, attendance:84, activity:"High",   tests:[7,7,8,7,7],  submissions:17, rank:6  },
    ],
    monthlyTrend:[{month:"Jan",score:6.2},{month:"Feb",score:6.5},{month:"Mar",score:6.8},{month:"Apr",score:7.0},{month:"May",score:7.1},{month:"Jun",score:7.4}],
    topicScores:[{topic:"Physics",score:78},{topic:"Chemistry",score:62},{topic:"Biology",score:74},{topic:"Env Sci",score:69},{topic:"Organic",score:54}],
  },
  {
    id: "cls_9a", name: "Class 9-A", subject: "English", teacher: "Ms. Banerjee",
    totalStudents: 22, avgScore: 6.9, avgAttendance: 78, topTopic: "Creative Writing", weakTopic: "Grammar",
    color: "#ea580c", icon: "✍",
    students: [
      { id:"s201", name:"Aisha Qureshi",   score:8.0, attendance:89, activity:"High",   tests:[8,8,8,8,8], submissions:18, rank:3  },
      { id:"s202", name:"Bhuvan Shastri",  score:5.5, attendance:66, activity:"Medium", tests:[5,6,5,6,5], submissions:12, rank:15 },
      { id:"s203", name:"Chetna Nair",     score:7.5, attendance:85, activity:"High",   tests:[7,8,7,8,7], submissions:17, rank:6  },
      { id:"s204", name:"Dhruv Malhotra",  score:4.0, attendance:52, activity:"Low",    tests:[4,4,4,4,4], submissions:8,  rank:21 },
      { id:"s205", name:"Eesha Reddy",     score:9.1, attendance:96, activity:"High",   tests:[9,9,9,9,9], submissions:20, rank:1  },
      { id:"s206", name:"Farhan Siddiqui", score:6.0, attendance:71, activity:"Medium", tests:[6,6,6,6,6], submissions:13, rank:12 },
      { id:"s207", name:"Geeta Iyer",      score:8.6, attendance:93, activity:"High",   tests:[9,8,9,8,9], submissions:19, rank:2  },
      { id:"s208", name:"Himanshu Roy",    score:5.8, attendance:69, activity:"Medium", tests:[6,5,6,6,6], submissions:13, rank:13 },
      { id:"s209", name:"Ishaan Gupta",    score:7.2, attendance:82, activity:"High",   tests:[7,7,7,8,7], submissions:16, rank:7  },
      { id:"s210", name:"Jyoti Pandey",    score:6.5, attendance:75, activity:"Medium", tests:[6,7,6,7,6], submissions:14, rank:10 },
      { id:"s211", name:"Kunal Bajaj",     score:3.5, attendance:47, activity:"Low",    tests:[4,3,3,4,4], submissions:6,  rank:22 },
      { id:"s212", name:"Lavanya Pillai",  score:7.8, attendance:88, activity:"High",   tests:[8,7,8,8,8], submissions:18, rank:4  },
      { id:"s213", name:"Mihir Desai",     score:6.8, attendance:78, activity:"Medium", tests:[7,7,6,7,7], submissions:15, rank:9  },
      { id:"s214", name:"Nisha Chandra",   score:5.2, attendance:63, activity:"Medium", tests:[5,5,5,5,5], submissions:11, rank:16 },
      { id:"s215", name:"Omkar Jain",      score:7.6, attendance:86, activity:"High",   tests:[8,7,8,7,8], submissions:17, rank:5  },
    ],
    monthlyTrend:[{month:"Jan",score:6.0},{month:"Feb",score:6.2},{month:"Mar",score:6.5},{month:"Apr",score:6.7},{month:"May",score:6.9},{month:"Jun",score:7.1}],
    topicScores:[{topic:"Writing",score:80},{topic:"Reading",score:74},{topic:"Grammar",score:56},{topic:"Speaking",score:72},{topic:"Literature",score:68}],
  },
  {
    id: "cls_9b", name: "Class 9-B", subject: "Social Studies", teacher: "Mr. Srivastava",
    totalStudents: 30, avgScore: 5.8, avgAttendance: 69, topTopic: "Indian History", weakTopic: "Geography",
    color: "#dc2626", icon: "🌍",
    students: [
      { id:"s301", name:"Anil Tiwari",      score:7.5, attendance:85, activity:"High",   tests:[7,8,7,8,7], submissions:17, rank:4  },
      { id:"s302", name:"Babita Sharma",    score:4.2, attendance:54, activity:"Low",    tests:[4,4,4,4,5], submissions:9,  rank:24 },
      { id:"s303", name:"Chandu Rao",       score:5.8, attendance:69, activity:"Medium", tests:[6,6,5,6,6], submissions:13, rank:14 },
      { id:"s304", name:"Deepika Verma",    score:8.2, attendance:90, activity:"High",   tests:[8,8,9,8,8], submissions:19, rank:2  },
      { id:"s305", name:"Eshwar Naidu",     score:3.5, attendance:46, activity:"Low",    tests:[4,3,3,4,3], submissions:6,  rank:29 },
      { id:"s306", name:"Farah Khan",       score:6.8, attendance:78, activity:"High",   tests:[7,7,6,7,7], submissions:15, rank:8  },
      { id:"s307", name:"Ganesh Kulkarni",  score:5.0, attendance:62, activity:"Medium", tests:[5,5,5,5,5], submissions:11, rank:19 },
      { id:"s308", name:"Hina Ansari",      score:6.5, attendance:75, activity:"Medium", tests:[6,7,6,7,6], submissions:14, rank:10 },
      { id:"s309", name:"Indra Bhushan",    score:4.8, attendance:59, activity:"Low",    tests:[5,5,4,5,5], submissions:10, rank:21 },
      { id:"s310", name:"Jayanti Kumari",   score:7.8, attendance:88, activity:"High",   tests:[8,8,7,8,8], submissions:18, rank:3  },
      { id:"s311", name:"Kedar Joshi",      score:5.5, attendance:67, activity:"Medium", tests:[5,6,5,6,6], submissions:12, rank:16 },
      { id:"s312", name:"Lata Devi",        score:3.8, attendance:50, activity:"Low",    tests:[4,3,4,4,4], submissions:7,  rank:28 },
      { id:"s313", name:"Mahesh Choudhary", score:6.2, attendance:72, activity:"Medium", tests:[6,6,7,6,6], submissions:13, rank:12 },
      { id:"s314", name:"Nidhi Saxena",     score:7.0, attendance:81, activity:"High",   tests:[7,7,7,7,7], submissions:16, rank:6  },
      { id:"s315", name:"Onkar Mishra",     score:4.5, attendance:57, activity:"Low",    tests:[4,5,4,5,4], submissions:9,  rank:22 },
    ],
    monthlyTrend:[{month:"Jan",score:4.9},{month:"Feb",score:5.2},{month:"Mar",score:5.4},{month:"Apr",score:5.6},{month:"May",score:5.8},{month:"Jun",score:6.1}],
    topicScores:[{topic:"History",score:70},{topic:"Geography",score:51},{topic:"Civics",score:65},{topic:"Economics",score:60},{topic:"Culture",score:68}],
  },
  {
    id: "cls_8a", name: "Class 8-A", subject: "Computer Science", teacher: "Ms. Arora",
    totalStudents: 20, avgScore: 7.5, avgAttendance: 83, topTopic: "Python", weakTopic: "Data Structures",
    color: "#059669", icon: "⌨",
    students: [
      { id:"s401", name:"Aryan Kapoor",  score:9.5, attendance:98, activity:"High",   tests:[9,10,9,10,9], submissions:20, rank:1  },
      { id:"s402", name:"Bhavesh Modi",  score:6.5, attendance:75, activity:"Medium", tests:[6,7,6,7,6],   submissions:14, rank:10 },
      { id:"s403", name:"Charmi Shah",   score:7.8, attendance:87, activity:"High",   tests:[8,7,8,8,8],   submissions:17, rank:5  },
      { id:"s404", name:"Dev Parikh",    score:5.5, attendance:66, activity:"Medium", tests:[5,6,5,6,5],   submissions:12, rank:14 },
      { id:"s405", name:"Esha Trivedi",  score:8.8, attendance:94, activity:"High",   tests:[9,9,8,9,9],   submissions:19, rank:2  },
      { id:"s406", name:"Faisal Rahman", score:4.5, attendance:57, activity:"Low",    tests:[4,5,4,5,4],   submissions:9,  rank:18 },
      { id:"s407", name:"Garima Soni",   score:7.2, attendance:82, activity:"High",   tests:[7,7,7,8,7],   submissions:16, rank:7  },
      { id:"s408", name:"Harshil Mehta", score:8.0, attendance:90, activity:"High",   tests:[8,8,8,8,8],   submissions:18, rank:4  },
      { id:"s409", name:"Isha Nagpal",   score:6.8, attendance:78, activity:"Medium", tests:[7,7,6,7,7],   submissions:15, rank:9  },
      { id:"s410", name:"Jayesh Rathod", score:5.0, attendance:62, activity:"Medium", tests:[5,5,5,5,5],   submissions:11, rank:16 },
      { id:"s411", name:"Kirti Agrawal", score:8.5, attendance:93, activity:"High",   tests:[8,9,8,9,8],   submissions:19, rank:3  },
      { id:"s412", name:"Lokesh Bhatt",  score:4.2, attendance:54, activity:"Low",    tests:[4,4,4,4,5],   submissions:8,  rank:19 },
      { id:"s413", name:"Manan Thakkar", score:7.5, attendance:85, activity:"High",   tests:[7,8,7,8,7],   submissions:17, rank:6  },
      { id:"s414", name:"Niyati Vora",   score:6.0, attendance:72, activity:"Medium", tests:[6,6,6,6,6],   submissions:13, rank:12 },
      { id:"s415", name:"Ojas Desai",    score:3.8, attendance:49, activity:"Low",    tests:[4,3,4,4,3],   submissions:6,  rank:20 },
    ],
    monthlyTrend:[{month:"Jan",score:6.5},{month:"Feb",score:6.8},{month:"Mar",score:7.0},{month:"Apr",score:7.2},{month:"May",score:7.5},{month:"Jun",score:7.8}],
    topicScores:[{topic:"Python",score:85},{topic:"Web Dev",score:78},{topic:"DSA",score:60},{topic:"Algorithms",score:72},{topic:"Databases",score:70}],
  },
];

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function scoreColor(score: number): string {
  if (score >= 7.5) return "#059669";
  if (score >= 6) return "#2563eb";
  if (score >= 4.5) return "#d97706";
  return "#dc2626";
}
function scoreBg(score: number): string {
  if (score >= 7.5) return "#f0fdf4";
  if (score >= 6) return "#eff6ff";
  if (score >= 4.5) return "#fffbeb";
  return "#fef2f2";
}
function scoreBorder(score: number): string {
  if (score >= 7.5) return "#bbf7d0";
  if (score >= 6) return "#bfdbfe";
  if (score >= 4.5) return "#fde68a";
  return "#fecdd3";
}
function scoreLabel(score: number): string {
  if (score >= 7.5) return "Excellent";
  if (score >= 6) return "Good";
  if (score >= 4.5) return "Average";
  return "At Risk";
}

async function fetchInsight(
  type: "student" | "class",
  payload: object
): Promise<StudentInsight | ClassInsight> {
  const form = new FormData();
  form.append(type === "student" ? "student_data" : "class_data", JSON.stringify(payload));
  const res = await fetch(`${BASE_URL}/analytics/${type}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`Gemini: ${data.error}`);
  return data;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:10, padding:"10px 14px", boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
      <p style={{ fontSize:11, color:"#6b7280", fontWeight:700, marginBottom:4, letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize:20, fontWeight:800, color:p.color || "#111827", letterSpacing:"-0.03em" }}>{p.value}</p>
      ))}
    </div>
  );
}

function InsightDrawer({ open, onClose, type, data, result, loading, accentColor }: {
  open: boolean; onClose: () => void;
  type: "student" | "class"; data: Student | ClassData | null;
  result: StudentInsight | ClassInsight | null; loading: boolean; accentColor: string;
}) {
  if (!open) return null;
  const isStudent = type === "student";
  const si = result as StudentInsight | null;
  const ci = result as ClassInsight | null;
  const trendIcon = (t?: Trend) => t === "improving" ? <RiArrowUpLine size={14}/> : t === "declining" ? <RiArrowDownLine size={14}/> : <RiArrowRightLine size={14}/>;
  const trendColor = (t?: Trend) => t === "improving" ? "#059669" : t === "declining" ? "#dc2626" : "#d97706";

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:40, backdropFilter:"blur(3px)" }}/>
      <div style={{
        position:"fixed", top:0, right:0, bottom:0,
        width:"min(460px,100vw)", background:"#fff", zIndex:50,
        overflowY:"auto", borderLeft:"1.5px solid #e5e7eb",
        boxShadow:"-20px 0 60px rgba(0,0,0,0.1)",
        animation:"drawerIn 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #f1f5f9", position:"sticky", top:0, background:"#fff", zIndex:2, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:`${accentColor}12`, border:`1.5px solid ${accentColor}25`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <RiSparklingFill size={16} color={accentColor}/>
            </div>
            <div>
              <p style={{ fontSize:10, fontWeight:800, color:"#9ca3af", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:2 }}>
                AI Analysis · {isStudent ? "Student" : "Class"}
              </p>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#111827", letterSpacing:"-0.03em" }}>{(data as any)?.name}</h3>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:9, border:"1.5px solid #e5e7eb", background:"#f9fafb", color:"#6b7280", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background="#f3f4f6"; e.currentTarget.style.borderColor="#d1d5db"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#f9fafb"; e.currentTarget.style.borderColor="#e5e7eb"; }}>
            <RiCloseLine size={16}/>
          </button>
        </div>

        <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:16 }}>
              <div style={{ width:44, height:44, border:"3px solid #f1f5f9", borderTopColor:accentColor, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
              <p style={{ fontSize:13, color:"#6b7280", fontWeight:600 }}>Generating insights…</p>
            </div>
          ) : result ? (
            <>
              <div style={{ padding:"16px 18px", borderRadius:14, background:`${accentColor}08`, border:`1.5px solid ${accentColor}18` }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                  <RiSparklingFill size={12} color={accentColor}/>
                  <span style={{ fontSize:10, fontWeight:800, color:accentColor, letterSpacing:"0.12em", textTransform:"uppercase" }}>AI Summary</span>
                </div>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.8, letterSpacing:"-0.01em" }}>{result.summary}</p>
              </div>

              {isStudent && si ? (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div style={{ padding:"16px", borderRadius:12, background:"#fff", border:"1.5px solid #e5e7eb" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                        <RiShieldLine size={12} color="#6b7280"/>
                        <p style={{ fontSize:10, fontWeight:800, color:"#9ca3af", letterSpacing:"0.1em", textTransform:"uppercase" }}>Risk Level</p>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:si.riskLevel==="low"?"#059669":si.riskLevel==="medium"?"#d97706":"#dc2626", flexShrink:0 }}/>
                        <span style={{ fontSize:14, fontWeight:800, color:si.riskLevel==="low"?"#059669":si.riskLevel==="medium"?"#d97706":"#dc2626", letterSpacing:"0.04em" }}>{si.riskLevel?.toUpperCase()}</span>
                      </div>
                      {si.riskReason && <p style={{ fontSize:11, color:"#6b7280", lineHeight:1.6 }}>{si.riskReason}</p>}
                    </div>
                    <div style={{ padding:"16px", borderRadius:12, background:"#fff", border:"1.5px solid #e5e7eb" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                        <RiLineChartLine size={12} color="#6b7280"/>
                        <p style={{ fontSize:10, fontWeight:800, color:"#9ca3af", letterSpacing:"0.1em", textTransform:"uppercase" }}>Forecast</p>
                      </div>
                      <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                        <span style={{ fontSize:30, fontWeight:800, color:accentColor, lineHeight:1, letterSpacing:"-0.04em" }}>{si.performancePrediction?.nextMonthScore}</span>
                        <span style={{ fontSize:13, color:"#9ca3af" }}>/10</span>
                        <span style={{ color:trendColor(si.performancePrediction?.trend), marginLeft:4, display:"flex" }}>{trendIcon(si.performancePrediction?.trend)}</span>
                      </div>
                      <p style={{ fontSize:10, color:"#9ca3af", marginTop:5 }}>Next month</p>
                    </div>
                  </div>

                  {[
                    { label:"Strengths", items:si.strengths, tc:"#059669", bg:"#f0fdf4", border:"#bbf7d0" },
                    { label:"Weaknesses", items:si.weaknesses, tc:"#dc2626", bg:"#fef2f2", border:"#fecdd3" },
                  ].map(({ label, items, tc, bg, border }) => (
                    <div key={label} style={{ padding:"16px", borderRadius:12, background:bg, border:`1.5px solid ${border}` }}>
                      <p style={{ fontSize:10, fontWeight:800, color:tc, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>{label}</p>
                      {items?.map((s, i) => (
                        <div key={i} style={{ display:"flex", gap:8, marginBottom:7, alignItems:"flex-start" }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:tc, marginTop:7, flexShrink:0 }}/>
                          <span style={{ fontSize:13, color:"#374151", lineHeight:1.7 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div style={{ padding:"14px 16px", borderRadius:12, background:"#fffbeb", border:"1.5px solid #fde68a" }}>
                    <p style={{ fontSize:10, fontWeight:800, color:"#d97706", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>Focus Areas</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                      {si.areasToImprove?.map((a, i) => (
                        <span key={i} style={{ fontSize:12, fontWeight:700, padding:"4px 11px", borderRadius:8, background:"#fef3c7", color:"#92400e", border:"1px solid #fde68a" }}>{a}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding:"16px", borderRadius:12, background:"#fff", border:"1.5px solid #e5e7eb" }}>
                    <p style={{ fontSize:10, fontWeight:800, color:"#9ca3af", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14 }}>Test Score History</p>
                    <ResponsiveContainer width="100%" height={90}>
                      <AreaChart data={(data as Student)?.tests?.map((v, i) => ({ t:`T${i+1}`, v }))}>
                        <defs>
                          <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={accentColor} stopOpacity={0.18}/>
                            <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="t" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                        <YAxis domain={[0,10]} hide/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Area type="monotone" dataKey="v" stroke={accentColor} strokeWidth={2} fill="url(#tg2)" dot={{ fill:accentColor, r:3, strokeWidth:0 }}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {si.learningStyle && (
                    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:12, background:`${accentColor}08`, border:`1.5px solid ${accentColor}18` }}>
                      <div style={{ width:34, height:34, borderRadius:9, background:`${accentColor}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <RiBrainLine size={15} color={accentColor}/>
                      </div>
                      <div>
                        <p style={{ fontSize:10, color:accentColor, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>Learning Style</p>
                        <p style={{ fontSize:13, color:"#111827", fontWeight:700 }}>{si.learningStyle}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : ci ? (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      { label:"Top Performers", items:ci.topPerformers?.slice(0,4), tc:"#059669", bg:"#f0fdf4", border:"#bbf7d0" },
                      { label:"At Risk", items:ci.atRiskStudents?.slice(0,4), tc:"#dc2626", bg:"#fef2f2", border:"#fecdd3" },
                    ].map(({ label, items, tc, bg, border }) => (
                      <div key={label} style={{ background:bg, border:`1.5px solid ${border}`, borderRadius:12, padding:"14px" }}>
                        <p style={{ fontSize:10, fontWeight:800, color:tc, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>{label}</p>
                        {items?.map((name, i) => (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                            <span style={{ width:5, height:5, borderRadius:"50%", background:tc, flexShrink:0 }}/>
                            <span style={{ fontSize:12, color:"#374151", fontWeight:600 }}>{name}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding:"16px", borderRadius:12, background:"#f5f3ff", border:"1.5px solid #e9d5ff" }}>
                    <p style={{ fontSize:10, fontWeight:800, color:"#7c3aed", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Topic Focus</p>
                    <p style={{ fontSize:12, color:"#374151", marginBottom:5 }}>
                      Strong: <span style={{ color:"#059669", fontWeight:700 }}>{ci.topicAnalysis?.strongTopics?.join(", ")}</span>
                    </p>
                    <p style={{ fontSize:12, color:"#374151", marginBottom:12 }}>
                      Weak: <span style={{ color:"#dc2626", fontWeight:700 }}>{ci.topicAnalysis?.weakTopics?.join(", ")}</span>
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 12px", borderRadius:9, background:"#ede9fe", border:"1px solid #ddd6fe" }}>
                      <RiLightbulbLine size={12} color="#7c3aed"/>
                      <span style={{ fontSize:12, color:"#5b21b6", fontWeight:700 }}>Focus: {ci.topicAnalysis?.recommendedFocus}</span>
                    </div>
                  </div>

                  <div style={{ padding:"18px", borderRadius:14, background:`${accentColor}08`, border:`1.5px solid ${accentColor}18` }}>
                    <p style={{ fontSize:10, fontWeight:800, color:"#6b7280", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>Predicted Class Avg</p>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                      <span style={{ fontSize:44, fontWeight:800, color:accentColor, lineHeight:1, letterSpacing:"-0.04em" }}>{ci.performancePrediction?.nextMonthAvg}</span>
                      <span style={{ fontSize:15, color:"#9ca3af" }}>/10</span>
                      <span style={{ color:trendColor(ci.performancePrediction?.trend), marginLeft:4, display:"flex" }}>{trendIcon(ci.performancePrediction?.trend)}</span>
                    </div>
                    <p style={{ fontSize:12, color:"#4b5563", marginTop:10, lineHeight:1.75 }}>{ci.performancePrediction?.explanation}</p>
                  </div>

                  {ci.attendanceInsight && (
                    <div style={{ display:"flex", gap:10, padding:"14px 16px", borderRadius:12, background:"#f0f9ff", border:"1.5px solid #bae6fd" }}>
                      <RiCalendarLine size={14} color="#0891b2" style={{ flexShrink:0, marginTop:2 }}/>
                      <p style={{ fontSize:13, color:"#0c4a6e", lineHeight:1.7 }}>{ci.attendanceInsight}</p>
                    </div>
                  )}

                  {ci.engagementInsight && (
                    <div style={{ display:"flex", gap:10, padding:"14px 16px", borderRadius:12, background:"#f0fdf4", border:"1.5px solid #bbf7d0" }}>
                      <RiGroupLine size={14} color="#059669" style={{ flexShrink:0, marginTop:2 }}/>
                      <p style={{ fontSize:13, color:"#14532d", lineHeight:1.7 }}>{ci.engagementInsight}</p>
                    </div>
                  )}

                  <div style={{ padding:"16px", borderRadius:12, background:"#fff", border:"1.5px solid #e5e7eb" }}>
                    <p style={{ fontSize:10, fontWeight:800, color:"#6b7280", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>Recommended Strategies</p>
                    {ci.recommendedStrategies?.map((s, i) => (
                      <div key={i} style={{ display:"flex", gap:8, marginBottom:9, alignItems:"flex-start" }}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background:accentColor, marginTop:7, flexShrink:0 }}/>
                        <span style={{ fontSize:13, color:"#374151", lineHeight:1.7 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {(result as any).actionItems?.length > 0 && (
                <div style={{ padding:"16px", borderRadius:12, background:"#fff", border:"1.5px solid #e5e7eb" }}>
                  <p style={{ fontSize:10, fontWeight:800, color:"#6b7280", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>Action Items</p>
                  {(result as any).actionItems.map((a: any, i: number) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:9 }}>
                      <span style={{
                        fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:5,
                        background:a.priority==="high"?"#fef2f2":"#fffbeb",
                        color:a.priority==="high"?"#dc2626":"#d97706",
                        flexShrink:0, marginTop:3, letterSpacing:"0.08em", textTransform:"uppercase",
                        border:`1px solid ${a.priority==="high"?"#fecdd3":"#fde68a"}`
                      }}>{a.priority}</span>
                      <span style={{ fontSize:13, color:"#374151", lineHeight:1.75 }}>{a.action}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#9ca3af" }}>
              <p style={{ fontSize:14 }}>Could not load analysis.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StudentRow({ student, classData, onInsight }: { student: Student; classData: ClassData; onInsight: () => void }) {
  const trendUp = student.tests.length >= 2 && student.tests[student.tests.length - 1] > student.tests[0];
  const sc = scoreColor(student.score);
  const actColor = student.activity === "High" ? "#059669" : student.activity === "Medium" ? "#d97706" : "#9ca3af";

  return (
    <tr style={{ borderBottom:"1px solid #f3f4f6", transition:"background 0.12s" }}
      onMouseEnter={e => e.currentTarget.style.background="#f9fafb"}
      onMouseLeave={e => e.currentTarget.style.background="transparent"}>
      <td style={{ padding:"13px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:`${classData.color}12`, border:`1.5px solid ${classData.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:classData.color, flexShrink:0, letterSpacing:"0.04em" }}>
            {initials(student.name)}
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:"#111827", letterSpacing:"-0.01em" }}>{student.name}</p>
            <p style={{ fontSize:11, color:"#9ca3af", marginTop:1, fontWeight:600 }}>Rank #{student.rank}</p>
          </div>
        </div>
      </td>
      <td style={{ padding:"13px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:40, height:4, borderRadius:99, background:"#f1f5f9", overflow:"hidden", flexShrink:0 }}>
            <div style={{ width:`${student.score * 10}%`, height:"100%", background:sc, borderRadius:99 }}/>
          </div>
          <span style={{ fontSize:13, fontWeight:800, color:sc, letterSpacing:"-0.02em" }}>{student.score}</span>
          <span style={{ color:trendUp ? "#059669" : "#dc2626", display:"flex" }}>
            {trendUp ? <RiArrowUpLine size={12}/> : <RiArrowDownLine size={12}/>}
          </span>
        </div>
      </td>
      <td style={{ padding:"13px 12px" }}>
        <span style={{ fontSize:13, fontWeight:700, color:student.attendance >= 80 ? "#059669" : student.attendance >= 65 ? "#d97706" : "#dc2626" }}>
          {student.attendance}%
        </span>
      </td>
      <td style={{ padding:"13px 12px" }} className="ci-hide-sm">
        <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:7, background:`${actColor}12`, color:actColor, border:`1px solid ${actColor}25`, letterSpacing:"0.02em" }}>
          {student.activity}
        </span>
      </td>
      <td style={{ padding:"13px 12px" }} className="ci-hide-sm">
        <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:7, background:scoreBg(student.score), color:scoreColor(student.score), border:`1px solid ${scoreBorder(student.score)}` }}>
          {scoreLabel(student.score)}
        </span>
      </td>
      {/* ── Analyse button cell ── */}
      <td style={{ padding:"13px 12px 13px 4px" }}>
        <button
          onClick={onInsight}
          className="ci-analyse-btn"
          style={{
            fontSize:12, fontWeight:700, padding:"6px 13px", borderRadius:8,
            border:`1.5px solid ${classData.color}28`, cursor:"pointer",
            background:`${classData.color}08`, color:classData.color,
            display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap",
            fontFamily:"inherit", transition:"all 0.15s", letterSpacing:"-0.01em",
          }}
          onMouseEnter={e => { e.currentTarget.style.background=`${classData.color}16`; e.currentTarget.style.transform="translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background=`${classData.color}08`; e.currentTarget.style.transform="translateY(0)"; }}
        >
          <RiSparklingFill size={11}/>
          <span className="ci-analyse-label"> Analyse</span>
        </button>
      </td>
    </tr>
  );
}

export default function AnalyticsPanel() {
  const [selectedClass, setSelectedClass] = useState<ClassData>(CLASSES[0]);
  const [activeTab, setActiveTab] = useState<"students" | "overview">("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [insightType, setInsightType] = useState<"student" | "class">("student");
  const [insightData, setInsightData] = useState<Student | ClassData | null>(null);
  const [insightResult, setInsightResult] = useState<StudentInsight | ClassInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cls = selectedClass;
  const filtered = cls.students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const atRiskCount = cls.students.filter(s => s.score < 5).length;
  const topCount = cls.students.filter(s => s.score >= 8).length;
  const maxScore = Math.max(...cls.students.map(s => s.score));

  const scoreDistData = [
    { range:"0–4",  count:cls.students.filter(s=>s.score<4).length,             fill:"#dc2626" },
    { range:"4–6",  count:cls.students.filter(s=>s.score>=4&&s.score<6).length, fill:"#d97706" },
    { range:"6–8",  count:cls.students.filter(s=>s.score>=6&&s.score<8).length, fill:cls.color },
    { range:"8–10", count:cls.students.filter(s=>s.score>=8).length,            fill:"#059669" },
  ];
  const activityData = [
    { name:"High",   value:cls.students.filter(s=>s.activity==="High").length,   fill:"#059669" },
    { name:"Medium", value:cls.students.filter(s=>s.activity==="Medium").length, fill:cls.color },
    { name:"Low",    value:cls.students.filter(s=>s.activity==="Low").length,    fill:"#dc2626" },
  ];

  const openStudentInsight = useCallback(async (student: Student) => {
    setInsightType("student");
    setInsightData(student);
    setInsightResult(null);
    setInsightLoading(true);
    setDrawerOpen(true);
    try {
      const payload = {
        ...student,
        className: cls.name,
        subject: cls.subject,
        teacher: cls.teacher,
        topicScores: cls.topicScores,
      };
      setInsightResult(await fetchInsight("student", payload));
    } catch (err: unknown) {
      console.error("Student insight error:", err);
      setInsightResult(null);
    } finally {
      setInsightLoading(false);
    }
  }, [cls]);

  const openClassInsight = useCallback(async () => {
    setInsightType("class");
    setInsightData(cls);
    setInsightResult(null);
    setInsightLoading(true);
    setDrawerOpen(true);
    try {
      const slimStudents = cls.students.map(s => ({
        name: s.name,
        score: s.score,
        attendance: s.attendance,
        activity: s.activity,
        rank: s.rank,
        submissions: s.submissions,
      }));
      const payload = {
        name: cls.name,
        subject: cls.subject,
        teacher: cls.teacher,
        totalStudents: cls.totalStudents,
        avgScore: cls.avgScore,
        avgAttendance: cls.avgAttendance,
        topTopic: cls.topTopic,
        weakTopic: cls.weakTopic,
        monthlyTrend: cls.monthlyTrend,
        topicScores: cls.topicScores,
        students: slimStudents,
      };
      setInsightResult(await fetchInsight("class", payload));
    } catch (err: unknown) {
      console.error("Class insight error:", err);
      setInsightResult(null);
    } finally {
      setInsightLoading(false);
    }
  }, [cls]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap');

        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes drawerIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.4} }

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        * { font-family:'Cabinet Grotesk','DM Sans',system-ui,sans-serif; }
        .syne { font-family:'Syne',system-ui,sans-serif !important; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        input:focus { outline:none; }
        button { font-family:inherit; }

        .ci-root { display:grid; grid-template-columns:256px 1fr; min-height:100vh; background:#f8fafc; }
        @media(max-width:860px) { .ci-root { grid-template-columns:1fr; } }

        .ci-sidebar {
          background:#fff; border-right:1.5px solid #e5e7eb;
          position:sticky; top:0; height:100vh; overflow-y:auto;
          z-index:20; display:flex; flex-direction:column;
        }
        @media(max-width:860px) {
          .ci-sidebar {
            position:fixed; top:0; left:0; bottom:0; width:272px;
            transform:translateX(-110%); transition:transform 0.25s cubic-bezier(0.22,1,0.36,1);
            z-index:35; box-shadow:6px 0 32px rgba(0,0,0,0.1);
          }
          .ci-sidebar.open { transform:translateX(0); }
        }

        .ci-main { display:flex; flex-direction:column; min-width:0; }
        .ci-header { background:#fff; border-bottom:1.5px solid #e5e7eb; position:sticky; top:0; z-index:30; }
        .ci-header-inner { padding:0 28px; height:62px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        @media(max-width:860px) { .ci-header-inner { padding:0 16px; } }

        /* ── FIX 1: shrink header title on small screens ── */
        @media(max-width:480px) {
          .ci-header-inner { height:54px; gap:8px; }
          .ci-header-title.syne { font-size:13px !important; }
          .ci-header-sub { font-size:10px !important; }
        }

        .ci-content { padding:24px 28px 80px; width:100%; }
        @media(max-width:600px) { .ci-content { padding:16px 14px 80px; } }

        .ci-kpi { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
        @media(max-width:900px) { .ci-kpi { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:440px) { .ci-kpi { grid-template-columns:1fr 1fr; gap:10px; } }

        .ci-chart-pair { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media(max-width:580px) { .ci-chart-pair { grid-template-columns:1fr; } }

        .ci-mini { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        @media(max-width:480px) { .ci-mini { grid-template-columns:1fr 1fr; } }

        .ci-card { background:#fff; border:1.5px solid #e5e7eb; border-radius:16px; overflow:hidden; transition:box-shadow 0.2s, border-color 0.2s; }
        .ci-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.06); }

        .ci-tabs { display:flex; gap:2px; padding:3px; border-radius:10px; background:#f1f5f9; width:fit-content; }
        .ci-tab { border:none; cursor:pointer; padding:7px 16px; border-radius:8px; font-size:13px; font-weight:700; transition:all 0.15s; background:transparent; color:#6b7280; letter-spacing:-0.01em; font-family:inherit; }
        .ci-tab.active { background:#fff; color:#111827; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
        .ci-tab:hover:not(.active) { color:#374151; }

        table { width:100%; border-collapse:collapse; }
        th { padding:11px 20px; text-align:left; font-size:10px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:#9ca3af; background:#f9fafb; border-bottom:1.5px solid #e5e7eb; white-space:nowrap; }
        .ci-tbl-wrap { overflow-x:auto; }
        @media(max-width:560px) { .ci-hide-sm { display:none; } }

        .ci-search { width:190px; padding:8px 12px 8px 34px; border-radius:9px; border:1.5px solid #e5e7eb; background:#f9fafb; font-size:13px; color:#111827; transition:all 0.15s; letter-spacing:-0.01em; font-family:inherit; }
        .ci-search:focus { border-color:var(--accent,#2563eb); background:#fff; box-shadow:0 0 0 3px rgba(37,99,235,0.08); }
        .ci-search::placeholder { color:#9ca3af; }
        @media(max-width:400px) { .ci-search { width:140px; } }

        .ci-ai-btn { border:none; cursor:pointer; padding:8px 16px; border-radius:9px; font-size:13px; font-weight:800; display:flex; align-items:center; gap:6px; color:#fff; transition:all 0.15s; letter-spacing:-0.01em; font-family:'Syne',sans-serif; white-space:nowrap; }
        .ci-ai-btn:hover { opacity:0.88; transform:translateY(-1px); }

        /* ── FIX 2: shrink AI Analysis button text on very small screens ── */
        @media(max-width:400px) {
          .ci-ai-btn { padding:7px 10px; font-size:12px; gap:4px; }
          .ci-ai-btn-label { display:none; }
        }

        .ci-class-btn { width:100%; text-align:left; padding:10px 10px; border-radius:10px; cursor:pointer; border:1.5px solid transparent; transition:all 0.15s; font-family:inherit; background:transparent; }
        .ci-class-btn:hover { background:#f8fafc; border-color:#e5e7eb; }
        .ci-class-btn.active { background:#eff6ff; border-color:#bfdbfe; }

        .ci-hamburger { display:none; }
        @media(max-width:860px) { .ci-hamburger { display:flex; } }

        .ci-live-dot { width:7px; height:7px; border-radius:50%; background:#10b981; animation:pulseDot 2s ease infinite; display:inline-block; }

        .ci-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.28); z-index:34; backdrop-filter:blur(2px); }
        @media(max-width:860px) { .ci-overlay { display:block; } }

        .anim-up { animation:slideUp 0.28s ease; }

        /* ── FIX 3: Analyse button — icon-only on small screens ── */
        .ci-analyse-btn { flex-shrink:0; }
        @media(max-width:560px) {
          .ci-analyse-btn { padding:6px 8px !important; gap:0 !important; }
          .ci-analyse-label { display:none; }
        }
      `}</style>

      <div className="ci-root">
        {sidebarOpen && <div className="ci-overlay" onClick={() => setSidebarOpen(false)}/>}

        <aside className={`ci-sidebar${sidebarOpen ? " open" : ""}`}>
          <div style={{ padding:"18px 16px", borderBottom:"1px solid #f1f5f9" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#2563eb,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 14px rgba(37,99,235,0.28)" }}>
                <RiGraduationCapLine size={17} color="#fff"/>
              </div>
              <div>
                <h1 className="syne" style={{ fontSize:17, fontWeight:800, color:"#111827", letterSpacing:"-0.04em", lineHeight:1 }}>ClassIntel</h1>
                <p style={{ fontSize:9, color:"#9ca3af", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", marginTop:3 }}>Education Analytics</p>
              </div>
            </div>
          </div>

          <div style={{ padding:"14px 10px", flex:1, overflowY:"auto" }}>
            <p style={{ fontSize:9, fontWeight:800, color:"#9ca3af", letterSpacing:"0.14em", textTransform:"uppercase", padding:"0 6px", marginBottom:8 }}>Classes</p>
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              {CLASSES.map(c => {
                const risk = c.students.filter(s => s.score < 5).length;
                const isActive = selectedClass.id === c.id;
                return (
                  <button key={c.id} className={`ci-class-btn${isActive ? " active" : ""}`}
                    onClick={() => { setSelectedClass(c); setSearchQuery(""); setActiveTab("students"); setSidebarOpen(false); }}>
                    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <div style={{ width:32, height:32, borderRadius:9, background:`${c.color}10`, border:`1.5px solid ${c.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{c.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <p style={{ fontSize:13, fontWeight:700, color:isActive ? "#1d4ed8" : "#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", letterSpacing:"-0.01em" }}>{c.name}</p>
                          <span className="syne" style={{ fontSize:13, fontWeight:800, color:c.color, letterSpacing:"-0.03em" }}>{c.avgScore}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:2 }}>
                          <p style={{ fontSize:11, color:"#6b7280" }}>{c.subject}</p>
                          {risk > 0 && <span style={{ fontSize:10, color:"#dc2626", fontWeight:800 }}>{risk} at risk</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ height:3, borderRadius:99, background:"#f1f5f9", marginTop:8, overflow:"hidden" }}>
                      <div style={{ width:`${c.avgScore * 10}%`, height:"100%", background:c.color, borderRadius:99 }}/>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding:"14px 16px", borderTop:"1px solid #f1f5f9" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span className="ci-live-dot"/>
              <span style={{ fontSize:11, color:"#6b7280", fontWeight:600 }}>5 classes · 125 students</span>
            </div>
          </div>
        </aside>

        <div className="ci-main">
          <header className="ci-header">
            <div className="ci-header-inner">
              <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1 }}>
                <button className="ci-hamburger" onClick={() => setSidebarOpen(true)} style={{ width:34, height:34, border:"1.5px solid #e5e7eb", borderRadius:8, background:"#f9fafb", color:"#6b7280", cursor:"pointer", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <RiMenuLine size={15}/>
                </button>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span className="ci-header-sub" style={{ fontSize:11, fontWeight:700, color:cls.color }}>{cls.subject}</span>
                    <span style={{ fontSize:11, color:"#d1d5db" }}>·</span>
                    <span className="ci-header-sub" style={{ fontSize:11, color:"#9ca3af", fontWeight:600 }}>{cls.teacher}</span>
                  </div>
                  <h2 className="ci-header-title syne" style={{ fontSize:17, fontWeight:800, color:"#111827", letterSpacing:"-0.04em", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {cls.name}
                  </h2>
                </div>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span className="ci-live-dot"/>
                  <span style={{ fontSize:11, color:"#6b7280", fontWeight:600 }}>Live</span>
                </div>
                <button className="ci-ai-btn" style={{ background:cls.color, boxShadow:`0 4px 14px ${cls.color}40` }} onClick={openClassInsight}>
                  <RiSparklingFill size={12}/>
                  <span className="ci-ai-btn-label">AI Analysis</span>
                </button>
              </div>
            </div>
          </header>

          <main className="ci-content">
            <div className="ci-kpi">
              {[
                { label:"Total Students", value:String(cls.totalStudents), sub:`${CLASSES.length} classes total`,   icon:<RiTeamLine size={14}/>,       color:"#2563eb" },
                { label:"Avg Score",      value:String(cls.avgScore),      sub:"out of 10",                         icon:<RiStarFill size={14}/>,         color:cls.color },
                { label:"Attendance",     value:`${cls.avgAttendance}%`,   sub:"this semester",                     icon:<RiCalendarLine size={14}/>,     color:"#059669" },
                { label:"At Risk",        value:String(atRiskCount),       sub:"need intervention",                 icon:<RiAlertLine size={14}/>,        color:"#dc2626" },
              ].map((k, i) => (
                <div key={i} className="ci-card" style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                    <p style={{ fontSize:10, fontWeight:800, color:"#9ca3af", letterSpacing:"0.12em", textTransform:"uppercase" }}>{k.label}</p>
                    <div style={{ width:30, height:30, borderRadius:8, background:`${k.color}10`, border:`1.5px solid ${k.color}20`, display:"flex", alignItems:"center", justifyContent:"center", color:k.color }}>
                      {k.icon}
                    </div>
                  </div>
                  <p className="syne" style={{ fontSize:22, fontWeight:800, color:"#111827", lineHeight:1, letterSpacing:"-0.04em" }}>{k.value}</p>
                  <p style={{ fontSize:11, color:"#9ca3af", marginTop:7, fontWeight:600 }}>{k.sub}</p>
                  <div style={{ height:3, borderRadius:99, background:"#f1f5f9", marginTop:14, overflow:"hidden" }}>
                    <div style={{ width:`${Math.min(parseFloat(k.value) * 10, 100)}%`, height:"100%", background:k.color, borderRadius:99, opacity:0.65 }}/>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom:18 }}>
              <div className="ci-tabs">
                {(["students","overview"] as const).map(tab => (
                  <button key={tab} className={`ci-tab${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
                    {tab === "students" ? "Students" : "Class Overview"}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "students" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }} className="anim-up">
                <div className="ci-mini">
                  {[
                    { label:"Top Score",      val:maxScore,     color:"#0891b2" },
                    { label:"At Risk",        val:atRiskCount,  color:"#dc2626" },
                    { label:"Top Performers", val:topCount,     color:"#059669" },
                  ].map((s, i) => (
                    <div key={i} className="ci-card" style={{ padding:"16px 18px", textAlign:"center" }}>
                      <p className="syne" style={{ fontSize:20, fontWeight:800, color:s.color, lineHeight:1, letterSpacing:"-0.04em" }}>{s.val}</p>
                      <p style={{ fontSize:10, color:"#6b7280", fontWeight:800, marginTop:8, letterSpacing:"0.1em", textTransform:"uppercase" }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="ci-card">
                  <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, background:"#fafafa" }}>
                    <div>
                      <h3 style={{ fontSize:14, fontWeight:800, color:"#111827", letterSpacing:"-0.02em" }}>All Students</h3>
                      <p style={{ fontSize:11, color:"#9ca3af", marginTop:2, fontWeight:600 }}>{filtered.length} records</p>
                    </div>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", display:"flex" }}>
                        <RiSearchLine size={13}/>
                      </span>
                      <input className="ci-search" placeholder="Search students…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ "--accent":cls.color } as any}/>
                    </div>
                  </div>
                  <div className="ci-tbl-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th><th>Score</th><th>Attendance</th>
                          <th className="ci-hide-sm">Activity</th>
                          <th className="ci-hide-sm">Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(s => (
                          <StudentRow key={s.id} student={s} classData={cls} onInsight={() => openStudentInsight(s)}/>
                        ))}
                      </tbody>
                    </table>
                    {filtered.length === 0 && (
                      <div style={{ padding:"40px", textAlign:"center", color:"#9ca3af", fontSize:13, fontWeight:600 }}>No students found.</div>
                    )}
                  </div>
                </div>

                <div className="ci-card" style={{ padding:"18px 20px" }}>
                  <h3 style={{ fontSize:13, fontWeight:800, color:"#111827", marginBottom:16, display:"flex", alignItems:"center", gap:7, letterSpacing:"-0.01em" }}>
                    <RiBarChartLine size={14} color="#6b7280"/> Score Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={scoreDistData} barSize={30}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                      <XAxis dataKey="range" tick={{ fontSize:11, fill:"#9ca3af", fontWeight:600 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="count" radius={[6,6,0,0]}>
                        {scoreDistData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "overview" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }} className="anim-up">
                <div className="ci-card" style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
                    <h3 style={{ fontSize:13, fontWeight:800, color:"#111827", display:"flex", alignItems:"center", gap:7, letterSpacing:"-0.01em" }}>
                      <RiLineChartLine size={14} color="#6b7280"/> Monthly Performance
                    </h3>
                    <span style={{ fontSize:11, fontWeight:800, padding:"4px 10px", borderRadius:7, background:"#f0fdf4", color:"#059669", border:"1.5px solid #bbf7d0", display:"flex", alignItems:"center", gap:4 }}>
                      <RiArrowUpLine size={11}/> Improving
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={cls.monthlyTrend}>
                      <defs>
                        <linearGradient id={`g_${cls.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={cls.color} stopOpacity={0.14}/>
                          <stop offset="95%" stopColor={cls.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                      <XAxis dataKey="month" tick={{ fontSize:11, fill:"#9ca3af", fontWeight:600 }} axisLine={false} tickLine={false}/>
                      <YAxis domain={[0,10]} tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Area type="monotone" dataKey="score" stroke={cls.color} strokeWidth={2.5} fill={`url(#g_${cls.id})`}
                        dot={{ fill:cls.color, r:4, strokeWidth:0 }}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="ci-chart-pair">
                  <div className="ci-card" style={{ padding:"18px 20px" }}>
                    <h3 style={{ fontSize:13, fontWeight:800, color:"#111827", marginBottom:12, display:"flex", alignItems:"center", gap:7, letterSpacing:"-0.01em" }}>
                      <RiCompassLine size={14} color="#6b7280"/> Topic Coverage
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <RadarChart data={cls.topicScores}>
                        <PolarGrid stroke="#e5e7eb"/>
                        <PolarAngleAxis dataKey="topic" tick={{ fontSize:10, fill:"#6b7280", fontWeight:600 }}/>
                        <Radar dataKey="score" stroke={cls.color} fill={cls.color} fillOpacity={0.1} strokeWidth={2}/>
                        <Tooltip content={<CustomTooltip/>}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ci-card" style={{ padding:"18px 20px" }}>
                    <h3 style={{ fontSize:13, fontWeight:800, color:"#111827", marginBottom:12, display:"flex", alignItems:"center", gap:7, letterSpacing:"-0.01em" }}>
                      <RiGroupLine size={14} color="#6b7280"/> Activity Split
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={activityData} dataKey="value" cx="50%" cy="42%" innerRadius={44} outerRadius={64} paddingAngle={4}>
                          {activityData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                        </Pie>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend iconType="circle" iconSize={7} formatter={v => <span style={{ color:"#6b7280", fontSize:11, fontWeight:600 }}>{v}</span>}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="ci-card" style={{ padding:"18px 20px" }}>
                  <h3 style={{ fontSize:13, fontWeight:800, color:"#111827", marginBottom:18, display:"flex", alignItems:"center", gap:7, letterSpacing:"-0.01em" }}>
                    <RiBookLine size={14} color="#6b7280"/> Topic-wise Performance
                  </h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {cls.topicScores.map((t, i) => {
                      const bc = t.score >= 70 ? cls.color : t.score >= 55 ? "#d97706" : "#dc2626";
                      return (
                        <div key={i}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                            <span style={{ fontSize:13, color:"#374151", fontWeight:600 }}>{t.topic}</span>
                            <span style={{ fontSize:13, fontWeight:800, color:bc, letterSpacing:"-0.02em" }}>{t.score}%</span>
                          </div>
                          <div style={{ height:5, borderRadius:99, background:"#f1f5f9", overflow:"hidden" }}>
                            <div style={{ width:`${t.score}%`, height:"100%", background:bc, borderRadius:99, opacity:0.85 }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ padding:"22px 22px", borderRadius:16, background:`${cls.color}08`, border:`1.5px solid ${cls.color}20` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                    <RiSparklingFill size={13} color={cls.color}/>
                    <span style={{ fontSize:10, fontWeight:800, color:cls.color, textTransform:"uppercase", letterSpacing:"0.12em" }}>AI Prediction</span>
                  </div>
                  <h3 className="syne" style={{ fontSize:16, fontWeight:800, color:"#111827", marginBottom:8, letterSpacing:"-0.03em", lineHeight:1.4 }}>
                    {cls.name} projected to reach{" "}
                    <span style={{ color:cls.color }}>{(cls.avgScore + 0.8).toFixed(1)}/10</span>{" "}
                    next month
                  </h3>
                  <p style={{ fontSize:13, color:"#4b5563", lineHeight:1.8, marginBottom:16 }}>
                    Focused remediation on <span style={{ color:"#dc2626", fontWeight:700 }}>{cls.weakTopic}</span> could unlock the most growth. Run a full AI analysis for personalised strategies.
                  </p>
                  <button className="ci-ai-btn" style={{ background:cls.color, boxShadow:`0 4px 14px ${cls.color}40` }} onClick={openClassInsight}>
                    <RiSparklingFill size={12}/>
                    <span className="ci-ai-btn-label">Run Full AI Analysis</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <InsightDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        type={insightType} data={insightData}
        result={insightResult} loading={insightLoading}
        accentColor={cls.color}
      />
    </>
  );
}