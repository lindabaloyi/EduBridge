import { useEffect, useState } from "react";
import { Send, Mail } from "lucide-react";
import { SectionTitle } from "../../../components/common/SectionTitle";
import { theme } from "../../../styles/themes";
import { useCommunication } from "../../../hooks/useCommunication";

const { ink, cardPaper, hairline, brass, rust, sage, sageLight } = theme.colors;
const { mono } = theme.fonts;

const panel = {
  background: cardPaper,
  border: `1px solid ${hairline}`,
  borderRadius: 4,
  padding: "20px",
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  fontSize: 14,
  color: ink,
  background: "#fff",
  border: `1px solid ${hairline}`,
  borderRadius: 4,
  fontFamily: mono,
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: "150px",
};

export default function CommunicationPage() {
  const {
    classes,
    loadingClasses,
    classesError,
    guardians,
    loadingGuardians,
    error,
    loadGuardians,
    sendEmail,
  } = useCommunication();

  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadGuardians(selectedClassIds);
  }, [selectedClassIds, loadGuardians]);

  function toggleClass(id) {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleEmail(email) {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  }

  function toggleAll() {
    if (selectedEmails.length === guardians.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(guardians.map((g) => g.email));
    }
  }

  const canSend =
    selectedEmails.length > 0 && subject.trim() !== "" && body.trim() !== "" && !sending;

  async function handleSend() {
    const recipients = guardians.filter((g) => selectedEmails.includes(g.email));
    setSending(true);
    try {
      const result = await sendEmail({ subject: subject.trim(), body: body.trim(), recipients });
      setSuccessMessage(
        `✅ Message staged for ${result.recipients} guardian${result.recipients === 1 ? "" : "s"}. ` +
          "(Email delivery not wired up yet.)"
      );
      setSubject("");
      setBody("");
      setSelectedEmails([]);
      setSelectedClassIds([]);
      window.setTimeout(() => setSuccessMessage(null), 6000);
    } finally {
      setSending(false);
    }
  }

  const className = (id) => {
    const c = classes.find((x) => x.id === id);
    return c ? `${c.name}${c.grade ? ` (Grade ${c.grade})` : ""}` : id;
  };

  return (
    <div>
      <SectionTitle eyebrow="Communication" title="Message Guardians" />

      {successMessage && (
        <div
          className="mb-4 text-sm"
          style={{ background: sageLight, color: sage, borderRadius: 4, padding: "12px 16px" }}
        >
          {successMessage}
        </div>
      )}

      {classesError && (
        <div className="mb-3 text-sm" style={{ background: theme.colors.rustLight, color: rust, borderRadius: 4, padding: "8px 12px" }}>
          Could not load classes: {classesError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — class selection */}
        <div style={panel}>
          <h3 className="text-sm mb-1" style={{ fontFamily: theme.fonts.serif, color: ink }}>
            Select Classes
          </h3>
          <p className="text-xs mb-3" style={{ color: "#8A8370" }}>
            {selectedClassIds.length} class{selectedClassIds.length === 1 ? "" : "es"} selected
          </p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {loadingClasses && !classes.length ? (
              <p className="text-sm" style={{ color: "#8A8370" }}>Loading classes…</p>
            ) : classes.length === 0 ? (
              <p className="text-sm" style={{ color: "#8A8370" }}>No classes available.</p>
            ) : (
              classes.map((cls) => (
                <label key={cls.id} className="flex items-center gap-2 p-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClassIds.includes(cls.id)}
                    onChange={() => toggleClass(cls.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm" style={{ color: ink }}>
                    {cls.name}
                    <span className="text-xs ml-1" style={{ color: "#8A8370" }}>
                      {cls.grade ? `Grade ${cls.grade} · ` : ""}{cls.studentCount} students
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
        {/* Middle — guardian recipients */}
        <div style={panel}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm" style={{ fontFamily: theme.fonts.serif, color: ink }}>
              Guardians
            </h3>
            <span className="text-xs" style={{ color: "#8A8370" }}>
              {selectedEmails.length} / {guardians.length} selected
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: "#8A8370" }}>
            Guardian emails pulled from student records.
          </p>

          {selectedClassIds.length > 0 && guardians.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs underline mb-3"
              style={{ color: sage }}
            >
              {selectedEmails.length === guardians.length ? "Deselect all" : "Select all"}
            </button>
          )}

          <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
            {selectedClassIds.length === 0 ? (
              <p className="text-sm" style={{ color: "#8A8370" }}>Select a class to see guardians.</p>
            ) : loadingGuardians ? (
              <p className="text-sm" style={{ color: "#8A8370" }}>Loading guardians…</p>
            ) : guardians.length === 0 ? (
              <p className="text-sm" style={{ color: "#8A8370" }}>
                No guardians with an email found for the selected classes.
              </p>
            ) : (
              guardians.map((g) => (
                <label key={g.email} className="flex items-start gap-2 p-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(g.email)}
                    onChange={() => toggleEmail(g.email)}
                    className="w-4 h-4 mt-0.5 cursor-pointer"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm" style={{ color: ink }}>{g.name}</span>
                    <span className="block text-xs" style={{ color: "#8A8370", fontFamily: mono }}>
                      {g.email}
                    </span>
                    <span className="block text-xs" style={{ color: "#8A8370" }}>
                      Guardian of {g.studentName}
                      {g.className ? ` · ${g.className}` : ""}
                    </span>
                  </span>
                </label>
              ))
            )}
            {error && (
              <p className="text-xs" style={{ color: rust }}>Could not load guardians: {error}</p>
            )}
          </div>
        </div>
        {/* Right — compose */}
        <div style={panel}>
          <h3 className="text-sm mb-3" style={{ fontFamily: theme.fonts.serif, color: ink }}>
            Compose Message
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: "#6D6858", fontFamily: mono }}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: "#6D6858", fontFamily: mono }}>
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message here…"
                style={textareaStyle}
              />
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: "100%",
                padding: "10px 14px",
                fontFamily: mono,
                fontSize: 13,
                background: canSend ? brass : "#B9A78A",
                border: "none",
                borderRadius: 4,
                color: "#fff",
                cursor: canSend ? "pointer" : "not-allowed",
              }}
            >
              {sending ? <Send size={15} /> : <Mail size={15} />}
              {sending ? "Staging…" : "Send Message"}
            </button>

            <div className="flex justify-between text-xs" style={{ color: "#8A8370" }}>
              <span>{selectedEmails.length} recipient{selectedEmails.length === 1 ? "" : "s"}</span>
              <span>{selectedClassIds.length} class{selectedClassIds.length === 1 ? "" : "es"}</span>
            </div>

            {selectedClassIds.length > 0 && (
              <div className="pt-2" style={{ borderTop: `1px solid ${hairline}` }}>
                <p className="text-xs mb-1" style={{ color: "#6D6858" }}>Selected classes:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedClassIds.map((id) => (
                    <span
                      key={id}
                      className="text-xs px-2 py-0.5"
                      style={{ background: sageLight, color: sage, borderRadius: 2, fontSize: 10 }}
                    >
                      {className(id)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs mt-4" style={{ color: "#8A8370" }}>
        📝 UI foundation — recipient emails come from the database. Actual email delivery will be added later.
      </p>
    </div>
  );
}