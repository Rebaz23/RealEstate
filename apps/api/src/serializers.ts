import { Listing, Office } from "@prisma/client";
import { computeTrustScore } from "./agent/trust.js";

export async function serializeListing(listing: Listing & { office: Office }) {
  const { score, signalCount } = await computeTrustScore(listing.id);
  return {
    id: listing.id,
    officeId: listing.officeId,
    type: listing.type,
    status: listing.status,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    currency: listing.currency,
    neighborhood: listing.neighborhood,
    city: listing.city,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    areaSqm: listing.areaSqm,
    officeStatedCondition: listing.officeStatedCondition,
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
    office: {
      id: listing.office.id,
      name: listing.office.name,
      subscriptionTier: listing.office.subscriptionTier,
    },
    trustScore: score,
    trustSignalCount: signalCount,
  };
}

export async function serializeListings(listings: (Listing & { office: Office })[]) {
  return Promise.all(listings.map(serializeListing));
}
