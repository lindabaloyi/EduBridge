import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { SectionTitle } from "../../../components/common/SectionTitle";
import { theme } from "../../../styles/themes";
import { useTeachers } from "../../../hooks/useTeachers";

const { ink, cardPaper, hairline, brass, rust, sage, sageLight, rustLight } = theme.colors;
const { serif, mono } = theme.fonts;

const ITEMS_PER_PAGE = 5;

export default function TeachersPage() {
  const { data: teachers, loading, error, fetchTeachers, remove } = useTeachers();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      await fetchTeachers();
    } catch (err) {
      console.error("Failed to load teachers:", err);
    }
  };

  const filtered = teachers.filter((t) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return [t.firstName, t.lastName, t.email, t.employeeNo].some(
      (v) => v && v.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const indexOfLast = safePage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  const goto = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete teacher ${t.firstName} ${t.lastName}?`)) return;
    try {
      await remove(t.id);
      setSuccessMessage("Teacher deleted.");
      window.setTimeout(() => setSuccessMessage(null), 3000);
      await loadTeachers();
    } catch (err) {
      alert(err.message);
    }
  };

  const initials = (f, l) => `${(f || "")[0] || ""}${(l || "")[0] || ""}`.toUpperCase() || "?";
  const fullName = (f, l) => [f, l].filter(Boolean).join(" ") || "Unknown";

  if (loading && !teachers.length) {
    return (
      <div style={{ color: "#8A8370", textAlign: "center", padding: "40px" }}>
        Loading teachers…
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <SectionTitle eyebrow="Staff management" title="Teachers" />
        <button
          type="button"
          onClick={() => console.log("Add teacher")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: brass,
            border: "none",
            borderRadius: 4,
            color: "#fff",
            fontFamily: mono,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      {successMessage && (
        <div
          className="mb-4 text-sm"
          style={{ background: sageLight, color: sage, borderRadius: 4, padding: "12px 16px" }}
        >
          ✅ {successMessage}
        </div>
      )}

      {error && (
        <div
          className="mb-3 text-sm"
          style={{ background: rustLight, color: rust, borderRadius: 4, padding: "8px 12px" }}
        >
          Error loading teachers: {error}
        </div>
      )}

      <div className="mb-4">
        <div
          className="flex items-center gap-2"
          style={{
            maxWidth: 320,
            padding: "8px 12px",
            background: cardPaper,
            border: `1px solid ${hairline}`,
            borderRadius: 4,
          }}
        >
          <Search size={16} color="#8A8370" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or ID…"
            style={{
              width: "100%",
              background: "transparent",
              outline: "none",
              fontSize: 14,
              color: ink,
              fontFamily: mono,
            }}
          />
        </div>
        <span className="mt-1 block text-xs" style={{ color: "#8A8370" }}>
          {filtered.length} teacher{filtered.length === 1 ? "" : "s"} found
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: "#8A8370", textAlign: "center", padding: "40px" }}>
          {searchTerm ? "No teachers match your search." : "No teachers found."}
        </div>
      ) : (
        <>
          <div style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4, overflow: "hidden" }}>
            <div
              className="flex items-center px-4 py-2.5 text-xs uppercase"
              style={{
                borderBottom: `1px solid ${hairline}`,
                color: "#8A8370",
                fontFamily: mono,
                letterSpacing: "0.05em",
              }}
            >
              <span className="flex-1" style={{ minWidth: 0 }}>Teacher</span>
              <span style={{ width: 150 }}>Employee ID</span>
              <span style={{ width: 200 }}>Email</span>
              <span style={{ width: 200 }}>Actions</span>
            </div>

            {currentItems.map((t) => (
              <div key={t.id} className="flex items-center px-4 py-3" style={{ borderBottom: `1px solid ${hairline}` }}>
                <div className="flex-1 flex items-center gap-3" style={{ minWidth: 0 }}>
                  <div
                    className="w-9 h-9 flex items-center justify-center text-xs"
                    style={{ background: sageLight, color: sage, borderRadius: "50%", fontFamily: mono }}
                  >
                    {initials(t.firstName, t.lastName)}
                  </div>
                  <span className="truncate text-sm" style={{ color: ink, fontFamily: serif, fontSize: 15 }}>
                    {fullName(t.firstName, t.lastName)}
                  </span>
                </div>
                <div style={{ width: 150 }}>
                  <span className="text-xs" style={{ color: "#8A8370", fontFamily: mono }}>
                    {t.employeeNo || "—"}
                  </span>
                </div>
                <div style={{ width: 200 }}>
                  <span className="block truncate text-xs" style={{ color: "#8A8370" }}>
                    {t.email || "—"}
                  </span>
                </div>
                <div style={{ width: 200 }}>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => console.log("View teacher", t.id)}
                      title="View"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "5px 10px",
                        fontSize: 12,
                        fontFamily: mono,
                        background: sageLight,
                        color: sage,
                        border: "none",
                        borderRadius: 3,
                        cursor: "pointer",
                      }}
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => console.log("Edit teacher", t.id)}
                      title="Edit"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "5px 10px",
                        fontSize: 12,
                        fontFamily: mono,
                        background: cardPaper,
                        color: ink,
                        border: `1px solid ${hairline}`,
                        borderRadius: 3,
                        cursor: "pointer",
                      }}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t)}
                      title="Delete"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "5px 10px",
                        fontSize: 12,
                        fontFamily: mono,
                        background: rustLight,
                        color: rust,
                        border: "none",
                        borderRadius: 3,
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs" style={{ color: "#8A8370" }}>
                Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => goto(safePage - 1)}
                  disabled={safePage === 1}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    fontFamily: mono,
                    background: safePage === 1 ? "#E9E4D8" : cardPaper,
                    color: safePage === 1 ? "#A9A290" : ink,
                    border: `1px solid ${hairline}`,
                    borderRadius: 4,
                    cursor: safePage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goto(p)}
                      style={{
                        width: 28,
                        padding: "6px 0",
                        fontSize: 12,
                        fontFamily: mono,
                        background: p === safePage ? brass : cardPaper,
                        color: p === safePage ? "#fff" : ink,
                        border: `1px solid ${p === safePage ? brass : hairline}`,
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => goto(safePage + 1)}
                  disabled={safePage === totalPages}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    fontFamily: mono,
                    background: safePage === totalPages ? "#E9E4D8" : cardPaper,
                    color: safePage === totalPages ? "#A9A290" : ink,
                    border: `1px solid ${hairline}`,
                    borderRadius: 4,
                    cursor: safePage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}