# People RAG App (using Vercel AI SDK)

https://github.com/user-attachments/assets/9437fd11-c447-4983-a892-4da033e22359

A chatbot designed to not only store but also retrieve and provide information about your loved ones, such as relatives and friends. This intelligent system will only respond with data about individuals that are present in its extensive knowledge base. It's a user-friendly tool that allows you to easily access and store details about the people you care about.

This project uses the following stack:

- [Next.js](https://nextjs.org) 14 (App Router)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenAI](https://openai.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Postgres](https://www.postgresql.org/) with [ pgvector ](https://github.com/pgvector/pgvector)
- [shadcn-ui](https://ui.shadcn.com) and [TailwindCSS](https://tailwindcss.com) for styling

## Getting Started

Create a postgres database (some possible ways to do so):

- Create a free Postgres database with [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- Follow this [guide](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database) to set it up locally

Make a copy of the .env.example file and rename it to .env.

```bash
cp .env.example .env
```

Open the .env file and add

- Postgres connection string
- OpenAI API key.

Install dependencies

```bash
pnpm install
```

Migrate and push database schema to Postgres

```bash
pnpm db:migrate
pnpm db:push
```

Start the development server

```bash
pnpm run dev
```

Start the Drizzle Studio

```bash
pnpm db:studio
```

## References

[Retrieval-Augmented Generation (RAG) guide](https://sdk.vercel.ai/docs/guides/rag-chatbot).
