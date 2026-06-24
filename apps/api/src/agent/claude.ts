import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn(
    "[agent] ANTHROPIC_API_KEY is not set — /agent endpoints will fail until it's configured in apps/api/.env"
  );
}

export const anthropic = new Anthropic({ apiKey });

// Single place to bump the model version for the whole agent.
export const AGENT_MODEL = "claude-sonnet-4-6";
