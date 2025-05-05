// import OpenAI from 'openai';
import { generateText } from "ai"
import { google } from '@ai-sdk/google';

// const openai = new OpenAI({
//     baseURL: "https://openrouter.ai/api/v1",
//     apiKey: process.env.OPENROUTER_API_KEY,
//     defaultHeaders: {
//         "HTTP-Referer": "https://codenearby.space",
//         "X-Title": "CodeNearby",
//     },
// });


// export async function analyzeImageWithAI(imageUrl: string, prompt: string = "What is in this image?") {
//     try {
//         const completion = await openai.chat.completions.create({
//             model: "meta-llama/llama-4-maverick:free",
//             messages: [
//                 {
//                     role: "user",
//                     content: [
//                         {
//                             type: "text",
//                             text: prompt
//                         },
//                         {
//                             type: "image_url",
//                             image_url: {
//                                 url: imageUrl
//                             }
//                         }
//                     ]
//                 }
//             ],
//         });

//         return completion.choices[0].message;
//     } catch (error) {
//         console.error("Error analyzing image with AI:", error);
//         throw error;
//     }
// }

// export async function generateMessageWithMeta(prompt: string) {
//     console.log("Generating message with prompt:", prompt);
//     if (!prompt) {
//         console.error("Prompt is empty or undefined.");
//         return null;
//     }

//     try {
//         const completion = await openai.chat.completions.create({
//             model: "meta-llama/llama-4-maverick:free",
//             messages: [
//                 {
//                     role: "user",
//                     content: [
//                         {
//                             type: "text",
//                             text: prompt
//                         },
//                     ]
//                 }
//             ],
//         });
//         console.log({ completion });
//         return completion.choices[0].message.content;
//     } catch (error) {
//         console.error("Error analyzing text with AI:", error);
//         throw error;
//     }
// }



export async function generateMessage(prompt: string) {
    try {
        // Generate a response about the detailed profile
        const { text: aiResponse } = await generateText({
            model: google("models/gemini-2.0-flash-exp"),
            prompt: `${prompt}`,
            maxTokens: 8000,
        });

        // console.log("AI Response:", aiResponse);
        return aiResponse;
    } catch (error) {
        console.error("Error generating text with Google:", error);
        throw error;
    }
}