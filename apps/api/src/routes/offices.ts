import { Router } from "express";
import { db } from "../db.js";
import { computeOfficeTrustScore } from "../agent/trust.js";

export const officesRouter = Router();

officesRouter.get("/", async (_req, res) => {
  const offices = await db.office.findMany({
    include: { _count: { select: { listings: true, leads: true } } },
  });

  const withScores = await Promise.all(
    offices.map(async (office) => {
      const { score } = await computeOfficeTrustScore(office.id);
      return {
        id: office.id,
        name: office.name,
        phone: office.phone,
        email: office.email,
        subscriptionTier: office.subscriptionTier,
        leadCredits: office.leadCredits,
        createdAt: office.createdAt.toISOString(),
        listingCount: office._count.listings,
        leadCount: office._count.leads,
        trustScore: score,
      };
    })
  );

  res.json(withScores);
});

officesRouter.get("/:id", async (req, res) => {
  const office = await db.office.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { listings: true, leads: true } } },
  });
  if (!office) return res.status(404).json({ error: "Office not found" });

  const { score } = await computeOfficeTrustScore(office.id);
  res.json({
    id: office.id,
    name: office.name,
    phone: office.phone,
    email: office.email,
    subscriptionTier: office.subscriptionTier,
    leadCredits: office.leadCredits,
    createdAt: office.createdAt.toISOString(),
    listingCount: office._count.listings,
    leadCount: office._count.leads,
    trustScore: score,
  });
});
