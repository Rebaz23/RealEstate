import { db } from "../db.js";
import { EndUser, Listing } from "@prisma/client";

const NOTIFY_THRESHOLD = 50;

// Rule-based fit score (no LLM call — needs to run synchronously and cheaply
// on every listing create). Type and budget are hard filters since renting
// vs. buying and being priced out are disqualifying; neighborhood/bedrooms
// are soft signals that add up to a score.
function scoreFit(user: EndUser, listing: Listing): { score: number; reasons: string[] } | null {
  if (user.preferredType && user.preferredType !== listing.type) return null;

  const reasons: string[] = [];
  let score = 0;

  if (user.budgetMin != null || user.budgetMax != null) {
    const min = user.budgetMin ?? 0;
    const max = user.budgetMax ?? Infinity;
    const slack = 0.1;
    if (listing.price < min * (1 - slack) || listing.price > max * (1 + slack)) {
      return null;
    }
    score += 40;
    reasons.push(`fits your budget (${listing.currency} ${min || "0"}-${max === Infinity ? "+" : max})`);
  }

  if (user.preferredNeighborhood) {
    const matches = listing.neighborhood.toLowerCase().includes(user.preferredNeighborhood.toLowerCase());
    if (matches) {
      score += 30;
      reasons.push(`in your preferred area (${listing.neighborhood})`);
    } else {
      score -= 10;
    }
  }

  if (user.preferredBedrooms != null) {
    if (user.preferredBedrooms === listing.bedrooms) {
      score += 20;
      reasons.push(`${listing.bedrooms} bedrooms as requested`);
    } else if (Math.abs(user.preferredBedrooms - listing.bedrooms) === 1) {
      score += 5;
    }
  }

  if (score === 0) return null; // user has no usable preferences set
  return { score, reasons };
}

export async function matchNewListing(listingId: string): Promise<number> {
  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing) return 0;

  const users = await db.endUser.findMany({
    where: {
      OR: [
        { preferredType: { not: null } },
        { budgetMin: { not: null } },
        { budgetMax: { not: null } },
        { preferredNeighborhood: { not: null } },
        { preferredBedrooms: { not: null } },
      ],
    },
  });

  const notifications: { userId: string; listingId: string; reason: string }[] = [];
  for (const user of users) {
    const fit = scoreFit(user, listing);
    if (fit && fit.score >= NOTIFY_THRESHOLD) {
      notifications.push({
        userId: user.id,
        listingId: listing.id,
        reason: `New ${listing.type === "RENT" ? "rental" : "listing"}: ${fit.reasons.join(", ")}.`,
      });
    }
  }

  if (notifications.length > 0) {
    await db.notification.createMany({ data: notifications });
  }
  return notifications.length;
}
