import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../db';
import { and, cosineDistance, desc, eq, gt, sql } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';
import { people } from '../db/schema/people';

const embeddingModel = openai.embedding('text-embedding-ada-002');

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter((i) => i !== '');
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input
  });
  return embedding;
};

export const findRelevantContent = async ({
  question,
  person,
  relation
}: {
  question: string;
  person: string | null;
  relation: string | null;
}) => {
  console.log(`Searching ${question} for ${person} with relation ${relation}`);

  const p = await db
    .select({ id: people.id })
    .from(people)
    .where(
      person && relation
        ? and(eq(people.name, person), eq(people.relation, relation))
        : person
        ? eq(people.name, person)
        : relation
        ? eq(people.relation, relation)
        : undefined
    )
    .limit(1)
    .then((result) => result[0]);

  if (!p) {
    return {};
  }

  console.log('Person to be searched', p);

  const userQueryEmbedded = await generateEmbedding(question);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded
  )})`;
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(and(eq(embeddings.personId, p.id), gt(similarity, 0.5)))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarGuides;
};
