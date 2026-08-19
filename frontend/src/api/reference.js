import { get } from "./httpClient";

// Reference / picker data shared across features (terms, class & subject options).
export function fetchTerms() {
  return get("/api/terms");
}
