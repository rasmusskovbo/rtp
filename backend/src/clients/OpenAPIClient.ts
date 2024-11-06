import {OpenAI} from "openai";
import * as process from "process";

const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});

export async function getChat(prompt: string, instructions: string) {
    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: instructions,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'gpt-4o-mini',
        })

        return chatCompletion;
    } catch (e) {
        console.log("Error when making ChatGPT request: " + e)
        return null;
    }
}