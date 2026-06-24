import { Router } from "express";
import { z } from "zod";
import { runChatTurn, fetchMatchesForResponse } from "../agent/chat.js";
import { recordFeedback } from "../agent/feedback.js";
import { qualifyLead } from "../agent/qualify.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const agentRouter = Router();

const chatSchema = z.object({
  userId: z.string(),
  conversationId: z.string().optional(),
  message: z.string().min(1),
});

agentRouter.post("/chat", asyncHandler(async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const result = await runChatTurn(parsed.data.userId, parsed.data.conversationId, parsed.data.message);
    const matches = await fetchMatchesForResponse(result.matchIds);
    res.json({ conversationId: result.conversationId, reply: result.reply, matches });
  } catch (err) {
    console.error("agent/chat failed:", err);
    res.status(502).json({ error: "AI agent is unavailable. Check ANTHROPIC_API_KEY is configured." });
  }
}));

const feedbackSchema = z.object({
  userId: z.string(),
  listingId: z.string(),
  priceMatches: z.boolean().nullable(),
  conditionMatches: z.boolean().nullable(),
  stillAvailable: z.boolean().nullable(),
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});

agentRouter.post("/feedback", asyncHandler(async (req, res) => {
  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const signals = await recordFeedback(parsed.data);
  res.status(201).json({ signalsRecorded: signals.length });
}));

const qualifySchema = z.object({
  conversationId: z.string(),
  listingId: z.string(),
});

agentRouter.post("/qualify", asyncHandler(async (req, res) => {
  const parsed = qualifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const lead = await qualifyLead(parsed.data.conversationId, parsed.data.listingId);
    res.status(201).json({
      lead: {
        ...lead,
        createdAt: lead.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("agent/qualify failed:", err);
    res.status(502).json({ error: "AI agent is unavailable. Check ANTHROPIC_API_KEY is configured." });
  }
}));
