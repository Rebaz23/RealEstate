import { TrustSignalSource, TrustSignalType } from "@realestate/shared";
import { db } from "../db.js";

export interface FeedbackInput {
  listingId: string;
  priceMatches: boolean | null;
  conditionMatches: boolean | null;
  stillAvailable: boolean | null;
  rating?: number;
  comment?: string;
}

// Structured feedback maps directly to trust signals — no LLM call needed,
// the "AI asking the question" happens in the mobile feedback form itself.
export async function recordFeedback(input: FeedbackInput) {
  const rows: { listingId: string; source: TrustSignalSource; type: TrustSignalType; comment?: string; rating?: number }[] = [];

  if (input.priceMatches !== null) {
    rows.push({
      listingId: input.listingId,
      source: "USER_FEEDBACK",
      type: input.priceMatches ? "PRICE_MATCH" : "PRICE_MISMATCH",
    });
  }
  if (input.conditionMatches !== null) {
    rows.push({
      listingId: input.listingId,
      source: "USER_FEEDBACK",
      type: input.conditionMatches ? "CONDITION_MATCH" : "CONDITION_MISMATCH",
    });
  }
  if (input.stillAvailable !== null) {
    rows.push({
      listingId: input.listingId,
      source: "USER_FEEDBACK",
      type: input.stillAvailable ? "STILL_AVAILABLE" : "UNAVAILABLE",
    });
  }
  if (input.rating != null) {
    rows.push({
      listingId: input.listingId,
      source: "RATING",
      type: "RATING",
      rating: input.rating,
    });
  }
  if (input.comment) {
    rows.push({
      listingId: input.listingId,
      source: "COMMENT",
      type: "COMMENT",
      comment: input.comment,
    });
  }

  if (rows.length === 0) return [];

  await db.trustSignal.createMany({ data: rows });
  return rows;
}
