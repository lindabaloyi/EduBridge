// Minimal CSV parser (handles quoted fields + newlines in quotes).
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// Turns raw CSV rows into import row objects for the gradebook import API.
// Expected columns: [Student No / Student No, Mark, (optional) Status]
export function toImportRows(csvText) {
  const rows = parseCsv(csvText);
  if (!rows.length) return [];
  const [header] = rows;
  const col = {};
  header.forEach((h, i) => {
    const key = h.trim().toLowerCase();
    if (key.includes("student")) col.no = i;
    if (key === "mark" || key === "score" || key === "marks") col.mark = i;
    if (key === "status" || key === "absent" || key === "missing") col.status = i;
  });
  const useHeader = col.no != null || col.mark != null;
  const dataRows = useHeader ? rows.slice(1) : rows;

  return dataRows
    .map((r) => {
      const studentNo = useHeader && col.no != null ? r[col.no] : r[0];
      const mark = useHeader && col.mark != null ? r[col.mark] : r[1];
      const rawStatus = (useHeader && col.status != null ? r[col.status] : "") || "";
      let status = undefined;
      if (/absent/i.test(rawStatus)) status = "ABSENT";
      else if (/miss/i.test(rawStatus)) status = "MISSING";
      return {
        studentNo: studentNo == null ? "" : String(studentNo).trim(),
        mark: mark == null || mark.trim() === "" ? null : Number(mark),
        status,
      };
    })
    .filter((r) => r.studentNo !== "");
}