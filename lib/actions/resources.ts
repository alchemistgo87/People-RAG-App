'use server';

import { resources } from '@/lib/db/schema/resources';
import { db } from '../db';
import { generateEmbeddings } from '../ai/embedding';
import { embeddings as embeddingsTable } from '../db/schema/embeddings';
import { people } from '../db/schema/people';
import { and, eq } from 'drizzle-orm';

export const createResource = async ({
  content,
  personName,
  relation
}: {
  content: string;
  personName: string;
  relation: string;
}) => {
  console.log(`Creating resource for ${personName} with relation ${relation}`);
  try {
    var person: any;
    [person] = await db
      .select({ id: people.id })
      .from(people)
      .where(and(eq(people.name, personName), eq(people.relation, relation)))
      .limit(1);
    if (!person) {
      [person] = await db
        .insert(people)
        .values({ name: personName, relation })
        .returning();
      console.log('Added new person: ' + person);
    }
    const [resource] = await db
      .insert(resources)
      .values({ content, personId: person.id })
      .returning();

    const embeddings = await generateEmbeddings(content);

    await db.insert(embeddingsTable).values(
      embeddings.map((embedding) => ({
        personId: person.id,
        resourceId: resource.id,
        ...embedding
      }))
    );

    return 'Resource successfully created and embedded.';
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error, please try again.';
  }
};
