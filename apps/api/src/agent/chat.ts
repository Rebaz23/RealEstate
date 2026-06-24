import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db.js";
import { anthropic, AGENT_MODEL } from "./claude.js";
import { executeSearchListings, searchListingsTool, SearchListingsArgs } from "./tools.js";
import { serializeListing } from "../serializers.js";

const SYSTEM_PROMPT = `You are an AI real estate agent for a marketplace in Iraq (Baghdad and other cities).
You act like an experienced, honest human agent — not a search box. Your job:

1. Understand what the user actually wants (buy vs. rent, budget, neighborhood, bedrooms) through
   natural conversation. Ask short clarifying questions when key details are missing instead of
   guessing.
2. Use the search_listings tool to ground every recommendation in real, current listings — never
   invent properties, prices, or availability.
3. Be upfront about reliability. Each listing result includes a trustScore (0-100, 50 = no data yet).
   If a listing's trustScore is below 40, mention that other users have reported issues (price
   changed after contact, condition mismatch, etc.) before recommending it. If it's above 75, you can
   mention it's well-verified by past renters/buyers.
4. Keep replies short and conversational (2-4 sentences), like a text message from a helpful agent,
   not a report. Don't dump every field of every listing — highlight what matters for this user's
   stated needs and let the app's UI show full listing cards.
5. If the user seems ready to move forward on a specific listing (asking to view it, contact the
   office, or confirming they want it), tell them you'll connect them with the office.`;

function toAnthropicMessages(history: { role: string; content: string }[]): Anthropic.MessageParam[] {
  return history.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));
}

export interface ChatResult {
  conversationId: string;
  reply: string;
  matchIds: string[];
}

export async function runChatTurn(userId: string, conversationId: string | undefined, userMessage: string): Promise<ChatResult> {
  let conversation = conversationId
    ? await db.conversation.findUnique({ where: { id: conversationId } })
    : null;

  if (!conversation) {
    conversation = await db.conversation.create({ data: { userId } });
  }

  const history = await db.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });

  await db.message.create({
    data: { conversationId: conversation.id, role: "USER", content: userMessage },
  });

  const messages: Anthropic.MessageParam[] = [
    ...toAnthropicMessages(history),
    { role: "user", content: userMessage },
  ];

  const matchIds = new Set<string>();
  let finalText = "";

  // Tool-use loop: Claude may call search_listings multiple times before
  // producing a final natural-language reply.
  for (let turn = 0; turn < 4; turn++) {
    const response = await anthropic.messages.create({
      model: AGENT_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [searchListingsTool],
      messages,
    });

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (toolUseBlocks.length === 0) {
      finalText = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();
      break;
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const results = await executeSearchListings(block.input as SearchListingsArgs);
      results.forEach((r) => matchIds.add(r.id));
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(results),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  if (!finalText) {
    finalText = "Sorry, I'm having trouble finding matches right now — could you tell me a bit more about what you're looking for?";
  }

  await db.message.create({
    data: { conversationId: conversation.id, role: "ASSISTANT", content: finalText },
  });

  return { conversationId: conversation.id, reply: finalText, matchIds: Array.from(matchIds).slice(0, 6) };
}

export async function fetchMatchesForResponse(matchIds: string[]) {
  if (matchIds.length === 0) return [];
  const listings = await db.listing.findMany({
    where: { id: { in: matchIds } },
    include: { office: true },
  });
  // Preserve the relevance order Claude produced rather than DB order.
  const byId = new Map(listings.map((l) => [l.id, l]));
  const ordered = matchIds.map((id) => byId.get(id)).filter((l): l is NonNullable<typeof l> => Boolean(l));
  return Promise.all(ordered.map(serializeListing));
}
