import OpenAI from 'openai';
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://codenearby.space",
        "X-Title": "CodeNearby",
    },
});


export async function analyzeImageWithAI(imageUrl: string, prompt: string = "What is in this image?") {
    try {
        const completion = await openai.chat.completions.create({
            model: "meta-llama/llama-4-maverick:free",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl
                            }
                        }
                    ]
                }
            ],
        });

        return completion.choices[0].message;
    } catch (error) {
        console.error("Error analyzing image with AI:", error);
        throw error;
    }
}

export async function generateMessage(prompt: string) {
    try {
        const completion = await openai.chat.completions.create({
            model: "meta-llama/llama-4-maverick:free",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                    ]
                }
            ],
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error analyzing image with AI:", error);
        throw error;
    }
}