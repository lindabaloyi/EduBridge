import { prisma } from "../../../database/prisma.js";
import { weightedFinalPercent, markPercent, letterForPercent } from "../../../utils/gradeCalc.js";

// ── Build a full gradebook sheet ───────────────────────────
export async function getSheet({ termId, classId, subjectId }) {
  if (!termId || !classId || !subjectId) {
    throw Object.assign(new Error("termId, classId and subjectId are required"), { status: 400 });
  }

  const [assessments, students] = await Promise.all([
    prisma.assessment.findMany({
      where: { termId, classId, subjectId },
      orderBy: { date: "asc" },
    }),
    prisma.student.findMany({
      where: { classId },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, studentNo: true, firstName: true, lastName: true },
    }),
  ]);

  const marks =
    assessments.length > 0
      ? await prisma.studentMark.findMany({
          where: { assessmentId: { in: assessments.map((a) => a.id) } },
        })
      : [];

  const cellKey = (aId, sId) => `${aId}:${sId}`;
  const cellMap = new Map(marks.map((m) => [cellKey(m.assessmentId, m.studentId), m]));

  const studentRows = students.map((s) => {
    const cells = {};
    for (const a of assessments) {
      const m = cellMap.get(cellKey(a.id, s.id));
      cells[a.id] = m ? { markId: m.id, mark: m.mark, status: m.status } : null;
    }
    const finalPct = weightedFinalPercent(assessments, cells);
    return {
      id: s.id,
      studentNo: s.studentNo,
      firstName: s.firstName,
      lastName: s.lastName,
      cells,
      final: finalPct,
      letter: letterForPercent(finalPct),
    };
  });

  // Per-assessment summary stats.
  const assessmentRows = assessments.map((a) => {
    const list = studentRows.map((r) => r.cells[a.id]).filter(Boolean);
    const graded = list.filter((c) => c.status === "GRADED" && c.mark != null);
    return {
      id: a.id,
      name: a.name,
      type: a.type,
      date: a.date ? a.date.toISOString().split("T")[0] : null,
      maxMark: a.maxMark,
      weight: a.weight,
      status: a.status,
      graded: graded.length,
      missing: list.filter((c) => c.status === "MISSING" || c.mark == null).length,
      absent: list.filter((c) => c.status === "ABSENT").length,
      unentered: studentRows.length - list.length,
      average: averagePercent(a, mapToCellValues(list)),
    };
  });

  return {
    termId,
    classId,
    subjectId,
    assessments: assessmentRows,
    students: studentRows,
  };
}

function mapToCellValues(cells) {
  return cells.filter((c) => c.status === "GRADED" && c.mark != null).map((c) => c.mark);
}

function averagePercent(a, values) {
  if (!values.length) return null;
  const sum = values.reduce((s, v) => s + markPercent(v, a.maxMark), 0);
  return Math.round((sum / values.length) * 10) / 10;
}
async function assertAssessmentEditable(assessmentId) {
  const a = await prisma.assessment.findUnique({ where: { id: assessmentId }, select: { status: true, maxMark: true } });
  if (!a) throw Object.assign(new Error("Assessment not found"), { status: 404 });
  if (a.status === "LOCKED") throw Object.assign(new Error("Assessment is locked and cannot be edited"), { status: 403 });
  return a;
}

function buildMarkValue(mark, status, maxMark) {
  const m = mark == null || mark === "" ? null : Number(mark);
  if (m != null && (Number.isNaN(m) || m < 0 || m > maxMark)) {
    throw Object.assign(new Error(`Mark must be between 0 and ${maxMark}`), { status: 400 });
  }
  let s = status || "GRADED";
  if (!["GRADED", "MISSING", "ABSENT"].includes(s)) s = "GRADED";
  if (s === "GRADED" && m == null) s = "MISSING";
  return { mark: m, status: s };
}

// ── BULK ENTRY ─────────────────────────────────────────────
export async function bulkUpsertMarks(assessmentId, rows = []) {
  const a = await assertAssessmentEditable(assessmentId);
  let updated = 0;
  for (const row of rows) {
    if (!row.studentId) continue;
    const { mark, status } = buildMarkValue(row.mark, row.status, a.maxMark);
    await prisma.studentMark.upsert({
      where: { assessmentId_studentId: { assessmentId, studentId: row.studentId } },
      update: { mark, status, editedAt: new Date() },
      create: { assessmentId, studentId: row.studentId, mark, status, editedAt: new Date() },
    });
    updated++;
  }
  return { updated };
}

// ── SINGLE MARK EDIT ───────────────────────────────────────
export async function updateMark(markId, payload) {
  const existing = await prisma.studentMark.findUnique({ where: { id: markId }, include: { assessment: true } });
  if (!existing) throw Object.assign(new Error("Mark not found"), { status: 404 });
  if (existing.assessment.status === "LOCKED") throw Object.assign(new Error("Assessment is locked and cannot be edited"), { status: 403 });
  const { mark, status } = buildMarkValue(payload.mark, payload.status, existing.assessment.maxMark);
  const item = await prisma.studentMark.update({
    where: { id: markId },
    data: { mark, status, editedAt: new Date() },
  });
  return { id: item.id, mark: item.mark, status: item.status };
}

// ── IMPORT (by studentNo) ──────────────────────────────────
export async function importMarks({ assessmentId, rows = [] }) {
  const a = await assertAssessmentEditable(assessmentId);
  const students = await prisma.student.findMany({ where: { classId: a.classId }, select: { id: true, studentNo: true } });
  const byNo = new Map(students.map((s) => [s.studentNo.toLowerCase(), s]));

  let created = 0;
  let updated = 0;
  let notFound = 0;
  const skipped = [];

  for (const row of rows) {
    const no = (row.studentNo || "").toString().trim().toLowerCase();
    const student = byNo.get(no);
    if (!student) {
      notFound++;
      skipped.push(row.studentNo);
      continue;
    }
    const { mark, status } = buildMarkValue(row.mark, row.status, a.maxMark);
    const existing = await prisma.studentMark.findUnique({
      where: { assessmentId_studentId: { assessmentId, studentId: student.id } },
    });
    if (existing) {
      await prisma.studentMark.update({ where: { id: existing.id }, data: { mark, status, editedAt: new Date() } });
      updated++;
    } else {
      await prisma.studentMark.create({ data: { assessmentId, studentId: student.id, mark, status, editedAt: new Date() } });
      created++;
    }
  }

  return { created, updated, notFound, skipped, total: rows.length };
}
// ── EXPORT (CSV) ───────────────────────────────────────────
export async function exportCsv({ termId, classId, subjectId }) {
  const sheet = await getSheet({ termId, classId, subjectId });

  function cellText(cell) {
    if (!cell) return "";
    if (cell.status === "ABSENT") return "ABSENT";
    if (cell.status === "MISSING") return "MISSING";
    return cell.mark != null ? String(cell.mark) : "";
  }

  const header = ["Student", "Student No"];
  for (const a of sheet.assessments) header.push(`${a.name} (w${a.weight})`);
  header.push("Final %", "Grade");

  const rows = sheet.students.map((s) => {
    const line = [`${s.lastName}, ${s.firstName}`, s.studentNo];
    for (const a of sheet.assessments) line.push(cellText(s.cells[a.id]));
    line.push(s.final != null ? String(s.final) : "", s.letter || "");
    return line;
  });

  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

// ── FINALIZE / LOCK THE WHOLE BOOK ─────────────────────────
export async function finalizeBook({ termId, classId, subjectId }, lock = true) {
  const res = await prisma.assessment.updateMany({
    where: { termId, classId, subjectId, NOT: { status: "LOCKED" } },
    data: { status: "LOCKED" },
  });
  return { locked: res.count };
}

// ── TERM RESULT (per subject) for a student ────────────────
export async function getTermResult(studentId, termId) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw Object.assign(new Error("Student not found"), { status: 404 });

  const marks = await prisma.studentMark.findMany({
    where: { studentId, assessment: { termId } },
    include: { assessment: { include: { subject: true } } },
  });

  const bySubject = new Map();
  for (const m of marks) {
    const sid = m.assessment.subjectId;
    if (!bySubject.has(sid)) bySubject.set(sid, { subjectId: sid, subject: m.assessment.subject.name, assessments: [], markMap: {} });
    const entry = bySubject.get(sid);
    entry.assessments.push(m.assessment);
    entry.markMap[m.assessment.id] = m;
  }

  const results = [];
  for (const entry of bySubject.values()) {
    const cellsById = {};
    for (const a of entry.assessments) {
      const m = entry.markMap[a.id];
      cellsById[a.id] = { mark: m?.mark ?? null, status: m?.status ?? "MISSING" };
    }
    const final = weightedFinalPercent(entry.assessments, cellsById);
    results.push({
      subjectId: entry.subjectId,
      subject: entry.subject,
      assessments: entry.assessments.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        weight: a.weight,
        maxMark: a.maxMark,
        mark: entry.markMap[a.id]?.mark ?? null,
        status: entry.markMap[a.id]?.status ?? "MISSING",
        percent: markPercent(entry.markMap[a.id]?.mark ?? null, a.maxMark),
      })),
      final,
      letter: letterForPercent(final),
      entries: entry.assessments.length,
    });
  }
  return results.sort((x, y) => x.subject.localeCompare(y.subject));
}