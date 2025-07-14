// import OpenAI from 'openai';
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function generateMessage(prompt: string) {
  try {
    // Generate a response about the detailed profile
    const response = await generateText({
      model: google("models/gemini-2.0-flash-exp"),
      prompt: `${prompt}`,
      maxTokens: 8000,
    });

    // console.log("AI Response:", response);
    // Extract the text content from the response
    const aiResponse = response.text.trim();
    const tokensUsed = response.usage?.totalTokens || 0;
    return { aiResponse, tokensUsed };
  } catch (error) {
    console.error("Error generating text with Google:", error);
    throw error;
  }
}
