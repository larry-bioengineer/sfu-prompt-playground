import { convertToModelMessages, streamText, UIMessage } from 'ai';

import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, systemMessage }: { messages: UIMessage[]; systemMessage?: string } = await req.json();
    console.log(systemMessage);
    const result = streamText({
        model: openrouter.chat('x-ai/grok-4.1-fast:free'),
        system: systemMessage || 'You are a helpful assistant.',
        messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}