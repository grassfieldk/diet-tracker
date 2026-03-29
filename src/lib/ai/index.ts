import type { AIAdapter } from "./types";

export function getAIAdapter(): AIAdapter {
  if (process.env.GEMINI_API_KEY) {
    const { createGeminiAdapter } = require("./gemini");
    return createGeminiAdapter();
  }

  const { mockAdapter } = require("./mock");
  return mockAdapter;
}
