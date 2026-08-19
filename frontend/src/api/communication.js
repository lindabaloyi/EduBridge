import { get, buildQuery } from "./httpClient";

// Fetches guardians (with real emails) for one or more class ids.
// classIds: array of class ids | string -> "cls-1,cls-2"
export function fetchGuardians(classIds) {
  const ids = Array.isArray(classIds) ? classIds.join(",") : String(classIds || "");
  return get(`/api/communication/guardians${buildQuery({ classIds: ids })}`);
}

// Stub send — UI foundation only. No email is actually delivered yet.
// Wire this to a real delivery endpoint when email sending is implemented.
export function sendEmail(payload) {
  // eslint-disable-next-line no-console
  console.log("📧 [mock] Email would be sent:", payload);
  return Promise.resolve({
    success: true,
    id: "mock-email",
    recipients: payload.recipients?.length || 0,
  });
}
