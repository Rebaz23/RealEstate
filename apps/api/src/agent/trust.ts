import { TrustSignal } from "@prisma/client";
import { TrustSignalType } from "@realestate/shared";
import { db } from "../db.js";

// Heuristic point value per signal type. Reality-mismatch signals are
// weighted more negatively than the corresponding "match" signal is
// positive, since a single bad-faith listing should hurt more than one
// good report helps — false advertising is the failure mode we're
// guarding against.
const POINT_VALUES: Record<TrustSignalType, number> = {
  PRICE_MATCH: 12,
  PRICE_MISMATCH: -18,
  CONDITION_MATCH: 10,
  CONDITION_MISMATCH: -15,
  STILL_AVAILABLE: 8,
  UNAVAILABLE: -25,
  RATING: 0, // uses the numeric `rating` field instead, see below
  COMMENT: 0, // informational only, doesn't move the score on its own
  VIEW: 1,
  CONTACT_CLICK: 2,
};

const HALF_LIFE_DAYS = 30;
const SCALE = 2.5;
const BASELINE = 50;

function pointValue(signal: TrustSignal): number {
  if (signal.type === "RATING" && signal.rating != null) {
    return (signal.rating - 3) * 6; // 1-5 star rating -> -12..+12
  }
  return POINT_VALUES[signal.type as TrustSignalType] ?? 0;
}

function recencyWeight(createdAt: Date): number {
  const ageDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
}

export interface TrustScoreResult {
  score: number;
  signalCount: number;
}

export function computeTrustScoreFromSignals(signals: TrustSignal[]): TrustScoreResult {
  if (signals.length === 0) {
    return { score: BASELINE, signalCount: 0 };
  }

  let weightedSum = 0;
  let weightTotal = 0;
  for (const signal of signals) {
    const w = recencyWeight(signal.createdAt);
    weightedSum += pointValue(signal) * w;
    weightTotal += w;
  }

  const weightedAvg = weightTotal > 0 ? weightedSum / weightTotal : 0;
  const score = Math.round(BASELINE + weightedAvg * SCALE);
  return { score: Math.max(0, Math.min(100, score)), signalCount: signals.length };
}

export async function computeTrustScore(listingId: string): Promise<TrustScoreResult> {
  const signals = await db.trustSignal.findMany({ where: { listingId } });
  return computeTrustScoreFromSignals(signals);
}

export async function computeOfficeTrustScore(officeId: string): Promise<TrustScoreResult> {
  const signals = await db.trustSignal.findMany({
    where: { listing: { officeId } },
  });
  return computeTrustScoreFromSignals(signals);
}
