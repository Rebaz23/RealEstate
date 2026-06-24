import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { serializeListing, serializeListings } from "../serializers.js";
import { matchNewListing } from "../agent/match.js";

export const listingsRouter = Router();

const listQuerySchema = z.object({
  type: z.enum(["SALE", "RENT"]).optional(),
  neighborhood: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  officeId: z.string().optional(),
  status: z.enum(["ACTIVE", "PENDING", "SOLD", "RENTED", "SUSPENDED"]).optional(),
});

listingsRouter.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { type, neighborhood, minPrice, maxPrice, bedrooms, officeId, status } = parsed.data;

  const listings = await db.listing.findMany({
    where: {
      type,
      officeId,
      status: status ?? "ACTIVE",
      neighborhood: neighborhood ? { contains: neighborhood } : undefined,
      bedrooms: bedrooms,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    },
    include: { office: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(await serializeListings(listings));
});

listingsRouter.get("/:id", async (req, res) => {
  const listing = await db.listing.findUnique({
    where: { id: req.params.id },
    include: { office: true },
  });
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  res.json(await serializeListing(listing));
});

const createSchema = z.object({
  officeId: z.string(),
  type: z.enum(["SALE", "RENT"]),
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().default("USD"),
  neighborhood: z.string().min(1),
  city: z.string().default("Baghdad"),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  areaSqm: z.number().positive(),
  officeStatedCondition: z.string().min(1),
});

listingsRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const office = await db.office.findUnique({ where: { id: parsed.data.officeId } });
  if (!office) return res.status(404).json({ error: "Office not found" });

  const listing = await db.listing.create({
    data: parsed.data,
    include: { office: true },
  });

  // Fire-and-forget proactive matching against existing user preferences.
  matchNewListing(listing.id).catch((err) => console.error("matchNewListing failed:", err));

  res.status(201).json(await serializeListing(listing));
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  status: z.enum(["ACTIVE", "PENDING", "SOLD", "RENTED", "SUSPENDED"]).optional(),
  officeStatedCondition: z.string().min(1).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  areaSqm: z.number().positive().optional(),
});

listingsRouter.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await db.listing.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Listing not found" });

  // A price change on an existing listing is itself a passive trust signal:
  // offices that frequently reprice after listing erode buyer confidence.
  if (parsed.data.price != null && parsed.data.price !== existing.price) {
    await db.trustSignal.create({
      data: {
        listingId: existing.id,
        source: "OFFICE_PASSIVE",
        type: "PRICE_MISMATCH",
        comment: `Price changed from ${existing.price} to ${parsed.data.price} after listing`,
      },
    });
  }

  const listing = await db.listing.update({
    where: { id: req.params.id },
    data: parsed.data,
    include: { office: true },
  });

  res.json(await serializeListing(listing));
});
