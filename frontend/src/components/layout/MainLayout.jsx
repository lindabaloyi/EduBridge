import { Outlet, NavLink, useLocation } from "react-router-dom";
import { theme } from "../../styles/themes";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  GraduationCap,
  FileText,
  Library,
  ChevronRight,
} from "lucide-react";

const { ink, inkSoft, paper } = theme.colors;
const { serif, mono } = theme.fonts;

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { key: "students", label: "Students", icon: Users, path: "/students" },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck, path: "/attendance" },
  { key: "classes", label: "Classes", icon: BookOpen, path: "/classes" },
  { key: "subjects", label: "Subjects", icon: Library, path: "/subjects" },
  { key: "assessments", label: "Assessments", icon: FileText, path: "/assessments" },
  { key: "grades", label: "Gradebook", icon: GraduationCap, path: "/gradebook" },
];

const brass = theme.colors.brass;
const brassLight = theme.colors.brassLight;
const inkSoftBg = theme.colors.inkSoft;

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex" style={{ background: paper }}>
      {/* Sidebar — the book spine */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: ink }}>
        <div className="px-5 py-6" style={{ borderBottom: `1px solid ${inkSoft}` }}>
          <div style={{ fontFamily: serif, color: "#F4EFE3", fontSize: 20 }}>Elmridge Registry</div>
          <div style={{ fontFamily: mono, color: brassLight, fontSize: 11, marginTop: 4, letterSpacing: "0.08em" }}>
            SCHOOL RECORDS · EST. 1962
          </div>
        </div>
        <nav className="flex-1 px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 text-sm no-underline"
                style={{
                  background: active ? inkSoftBg : "transparent",
                  color: active ? brassLight : "#B9C0C9",
                  borderLeft: active ? `3px solid ${brass}` : "3px solid transparent",
                  borderRadius: 2,
                  display: "flex",
                  textAlign: "left",
                }}
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} />}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-5 py-4 text-xs" style={{ color: "#7C8794", borderTop: `1px solid ${inkSoft}` }}>
          Term 2 · Week 6
        </div>
      </aside>

      {/* Main ledger page */}
      <main className="flex-1 px-10 py-8 overflow-y-auto" style={{ maxHeight: "100vh" }}>
        <div style={{ maxWidth: 960 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}