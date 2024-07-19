import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    messages: convertToCoreMessages(messages),
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    If no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted about any person, use this tool without asking for confirmation.`,
        parameters: z.object({
          personName: z
            .string()
            .describe(
              'the name of the person to add to the knowledge base if he/she already does not exist'
            ),
          relation: z
            .string()
            .describe('the relation of the person with the user'),
          content: z
            .string()
            .describe(
              'the content or resource about the person to add to the knowledge base'
            )
        }),
        execute: async ({ content, personName, relation }) =>
          createResource({ content, personName, relation })
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          person: z.string().nullable().describe('the name of the person'),
          relation: z
            .string()
            .nullable()
            .describe('the relation with the person'),
          question: z.string().describe('the users question about the person')
        }),
        execute: async ({ question, person, relation }) =>
          findRelevantContent({ question, person, relation })
      })
    }
  });

  return result.toAIStreamResponse();
}
