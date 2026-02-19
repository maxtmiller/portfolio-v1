import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
            {
                role: "system",
                content: "You are a helpful assistant. Based on the conversation history provided, generate 3 short, engaging follow-up questions that a user might want to ask a developer about their portfolio. Keep them under 10 words each. Return ONLY a JSON array of strings, with title questions. Format: 'questions': ['Question 1', 'Question 2', 'Question 3']"
            },
            ...messages.slice(-3),
            ],
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(response.choices[0].message.content || "{}");
        return NextResponse.json(content);

    } catch (error: any) {
        console.error("Error in chat suggestion route:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}
