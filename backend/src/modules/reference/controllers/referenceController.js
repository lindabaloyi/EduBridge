import { listTerms } from "../services/referenceService.js";

export async function handleListTerms(_req, res, next) {
  try {
    res.json({ success: true, data: await listTerms() });
  } catch (err) {
    next(err);
  }
}
