import OpenAI from "openai";

const endpoint = "https://models.inference.ai.azure.com";

const openai = new OpenAI({
  baseURL: endpoint,
  apiKey: process.env.GITHUB_TOKEN_OPEN_AI,
});

export default openai;
