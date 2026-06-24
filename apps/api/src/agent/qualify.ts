import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db.js";
import { anthropic, AGENT_MODEL } from "./claude.js";

const QUALIFY_SYSTEM_PROMPT = `You are screening a real-estate buyer/renter conversation on behalf of the
listing office, the way an experienced human agent would before passing along a lead. Read the
conversation and the listing details, then call record_qualification with your honest assessment.
Be conservative: only mark budgetConfirmed true if the user explicitly stated a budget compatible
with the listing price, and only give a high intentScore if they showed concrete next-step intent
(asking to view, contact the office, confirming they want it) rather than just browsing.`;

const recordQualificationTool: Anthropic.Tool = {
  name: "record_qualification",
  description: "Record the qualification assessment for this lead.",
  input_schema: {
    type: "object",
    properties: {
      budgetConfirmed: {
        type: "boolean",
        description: "Whether the user explicitly confirmed a budget compatible with this listing.",
      },
      intentScore: {
        type: "number",
        description: "0-100 score of how ready/serious the user is to move forward.",
      },
      summary: {
        type: "string",
        description: "2-3 sentence summary for the office's agent: who this is, what they want, and why they're a good/weak lead.",
      },
    },
    required: ["budgetConfirmed", "intentScore", "summary"],
  },
};

export async function qualifyLead(conversationId: string, listingId: string) {
  const [conversation, listing] = await Promise.all([
    db.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }),
    db.listing.findUnique({ where: { id: listingId }, include: { office: true } }),
  ]);

  if (!conversation) throw new Error("Conversation not found");
  if (!listing) throw new Error("Listing not found");

  const transcript = conversation.messages
    .map((m) => `${m.role === "USER" ? "User" : "Agent"}: ${m.content}`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 512,
    system: QUALIFY_SYSTEM_PROMPT,
    tools: [recordQualificationTool],
    tool_choice: { type: "tool", name: "record_qualification" },
    messages: [
      {
        role: "user",
        content: `Listing: ${listing.title} — ${listing.price} ${listing.currency} in ${listing.neighborhood}, ${listing.bedrooms} bed / ${listing.bathrooms} bath.\n\nConversation transcript:\n${transcript || "(no messages yet)"}`,
      },
    ],
  });

  const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Model did not return a qualification");

  const input = toolUse.input as { budgetConfirmed: boolean; intentScore: number; summary: string };

  const lead = await db.lead.create({
    data: {
      listingId: listing.id,
      userId: conversation.userId,
      officeId: listing.officeId,
      status: "QUALIFIED",
      qualificationNotes: input.summary,
      budgetConfirmed: input.budgetConfirmed,
      intentScore: Math.max(0, Math.min(100, Math.round(input.intentScore))),
    },
  });

  await db.office.update({
    where: { id: listing.officeId },
    data: { leadCredits: Math.max(0, listing.office.leadCredits - 1) },
  });

  return lead;
}
