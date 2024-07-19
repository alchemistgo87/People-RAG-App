import { sql } from 'drizzle-orm';
import { text, varchar, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { nanoid } from '@/lib/utils';

export const people = pgTable('people', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  relation: text('relation').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`)
});

// Schema for resources - used to validate API requests
export const insertPersonSchema = createSelectSchema(people).extend({}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Type for resources - used to type API request params and within Components
export type NewPersonParams = z.infer<typeof insertPersonSchema>;
