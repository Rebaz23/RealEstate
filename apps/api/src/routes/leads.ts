import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";

export const leadsRouter = Router();

function serializeLead(lead: {
  id: string;
  listingId: string;
  userId: string;
  officeId: string;
  status: string;
  qualificationNotes: string;
  budgetConfirmed: boolean;
  intentScore: number;
  createdAt: Date;
  listing?: { title: string; neighborhood: string; price: number };
  user?: { name: string; phone: string };
}) {
  return {
    id: lead.id,
    listingId: lead.listingId,
    userId: lead.userId,
    officeId: lead.officeId,
    status: lead.status,
    qualificationNotes: lead.qualificationNotes,
    budgetConfirmed: lead.budgetConfirmed,
    intentScore: lead.intentScore,
    createdAt: lead.createdAt.toISOString(),
    listing: lead.listing,
    user: lead.user,
  };
}

leadsRouter.get("/", async (req, res) => {
  const officeId = typeof req.query.officeId === "string" ? req.query.officeId : undefined;

  const leads = await db.lead.findMany({
    where: { officeId },
    include: {
      listing: { select: { title: true, neighborhood: true, price: true } },
      user: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(leads.map(serializeLead));
});

const updateSchema = z.object({
  status: z.enum(["NEW", "QUALIFIED", "CONTACTED", "CLOSED_WON", "CLOSED_LOST"]),
});

leadsRouter.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await db.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Lead not found" });

  const lead = await db.lead.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
    include: {
      listing: { select: { title: true, neighborhood: true, price: true } },
      user: { select: { name: true, phone: true } },
    },
  });

  res.json(serializeLead(lead));
});
