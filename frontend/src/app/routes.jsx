import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import StudentsPage from "../features/students/pages/StudentsPage";
import AttendancePage from "../features/attendance/pages/AttendancePage";
import ClassesPage from "../features/classes/pages/ClassesPage";
import AssessmentsPage from "../features/assessments/pages/AssessmentsPage";
import GradebookPage from "../features/gradebook/pages/GradebookPage";
import SubjectsPage from "../features/subjects/pages/SubjectsPage";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#EFEAE0" }}>
      <div className="text-center">
        <h1
          className="text-6xl font-bold"
          style={{ color: "#1D2B3A", fontFamily: "'Lora', Georgia, serif" }}
        >
          404
        </h1>
        <p className="mt-2" style={{ color: "#8A8370" }}>
          Page not found.
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/grades" element={<GradebookPage />} />
          <Route path="/gradebook" element={<GradebookPage />} />
        </Route>

        <Route path="/404" element={<NotFoundPage />} />

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;