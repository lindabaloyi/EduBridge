import { SectionTitle } from "../../../components/common/SectionTitle";
import { MetricCard } from "../../../components/common/MetricCard";
import { theme } from "../../../styles/themes";

const { ink, cardPaper, hairline, rust, paper } = theme.colors;
const { serif, mono } = theme.fonts;

const STUDENTS = [
  { id: "STU-1042", name: "Amara Okafor", grade: "Grade 9-A", guardian: "Chidi Okafor", attendance: 96, avg: "A-" },
  { id: "STU-1043", name: "Liam Fischer", grade: "Grade 9-A", guardian: "Nora Fischer", attendance: 88, avg: "B+" },
  { id: "STU-1044", name: "Priya Nair", grade: "Grade 9-B", guardian: "Ravi Nair", attendance: 99, avg: "A" },
  { id: "STU-1045", name: "Mateo Rossi", grade: "Grade 10-A", guardian: "Elena Rossi", attendance: 74, avg: "C" },
  { id: "STU-1046", name: "Yuki Tanaka", grade: "Grade 10-A", guardian: "Kenji Tanaka", attendance: 91, avg: "B" },
  { id: "STU-1047", name: "Zoe van Dijk", grade: "Grade 10-B", guardian: "Bram van Dijk", attendance: 83, avg: "B-" },
  { id: "STU-1048", name: "Kofi Mensah", grade: "Grade 9-B", guardian: "Ama Mensah", attendance: 95, avg: "A-" },
  { id: "STU-1049", name: "Isla Campbell", grade: "Grade 10-B", guardian: "Fiona Campbell", attendance: 79, avg: "C+" },
];

const SCHEDULE = [
  { period: "1", time: "08:00 – 08:45", subject: "Mathematics", room: "Room 204", grade: "Grade 9-A" },
  { period: "2", time: "08:50 – 09:35", subject: "Biology", room: "Lab 3", grade: "Grade 9-B" },
  { period: "3", time: "09:40 – 10:25", subject: "World history", room: "Room 118", grade: "Grade 10-A" },
  { period: "4", time: "10:45 – 11:30", subject: "English literature", room: "Room 210", grade: "Grade 10-B" },
  { period: "5", time: "11:35 – 12:20", subject: "Chemistry", room: "Lab 1", grade: "Grade 9-A" },
];

export default function DashboardPage() {
  const avgAttendance = Math.round(STUDENTS.reduce((s, x) => s + x.attendance, 0) / STUDENTS.length);

  return (
    <div>
      <SectionTitle eyebrow="Registry overview" title="Good morning, Headteacher" />
      <div className="flex gap-4 mb-8 flex-wrap">
        <MetricCard label="Enrolled students" value={STUDENTS.length} sub="Across 4 sections" />
        <MetricCard label="Average attendance" value={`${avgAttendance}%`} sub="Last 30 days" />
        <MetricCard label="Classes today" value={SCHEDULE.length} sub="Periods 1 – 5" />
        <MetricCard label="Staff on roll" value={14} sub="2 on leave" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }} className="p-5">
          <h2 className="text-lg mb-3" style={{ fontFamily: serif, color: ink }}>
            Today's timetable
          </h2>
          <div>
            {SCHEDULE.map((row, i) => (
              <div
                key={row.period}
                className="flex items-center justify-between py-2"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${hairline}` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 flex items-center justify-center text-xs"
                    style={{ background: ink, color: paper, borderRadius: 2, fontFamily: mono }}
                  >
                    {row.period}
                  </span>
                  <div>
                    <div style={{ color: ink, fontSize: 14 }}>{row.subject}</div>
                    <div style={{ color: "#8A8370", fontSize: 12 }}>{row.grade} · {row.room}</div>
                  </div>
                </div>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#8A8370" }}>{row.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }} className="p-5">
          <h2 className="text-lg mb-3" style={{ fontFamily: serif, color: ink }}>
            Attendance below 85%
          </h2>
          <div>
            {STUDENTS.filter((s) => s.attendance < 85).map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${hairline}` }}
              >
                <div>
                  <div style={{ color: ink, fontSize: 14 }}>{s.name}</div>
                  <div style={{ color: "#8A8370", fontSize: 12, fontFamily: mono }}>{s.id}</div>
                </div>
                <span style={{ color: rust, fontFamily: mono, fontSize: 13 }}>{s.attendance}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}