import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const usersRouter = Router();

function serializeUser(user: {
  id: string;
  name: string;
  phone: string;
  preferredType: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredNeighborhood: string | null;
  preferredBedrooms: number | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    preferredType: user.preferredType ?? undefined,
    budgetMin: user.budgetMin ?? undefined,
    budgetMax: user.budgetMax ?? undefined,
    preferredNeighborhood: user.preferredNeighborhood ?? undefined,
    preferredBedrooms: user.preferredBedrooms ?? undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
});

usersRouter.post("/", asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await db.endUser.findUnique({ where: { phone: parsed.data.phone } });
  if (existing) return res.json(serializeUser(existing));

  const user = await db.endUser.create({ data: parsed.data });
  res.status(201).json(serializeUser(user));
}));

usersRouter.get("/:id", asyncHandler(async (req, res) => {
  const user = await db.endUser.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(serializeUser(user));
}));

const updateSchema = z.object({
  preferredType: z.enum(["SALE", "RENT"]).optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  preferredNeighborhood: z.string().optional(),
  preferredBedrooms: z.number().int().nonnegative().optional(),
});

usersRouter.patch("/:id", asyncHandler(async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await db.endUser.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "User not found" });

  const user = await db.endUser.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(serializeUser(user));
}));
