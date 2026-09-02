-- Dream Journal, semantic search addition.
-- Requires the pgvector extension, available on all Supabase projects.

create extension if not exists vector;

alter table dreams add column embedding vector(1536);

-- Cosine distance index. Only useful once a meaningful number of dreams
-- have embeddings, but harmless to create early.
create index dreams_embedding_idx on dreams
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Scoped to the caller's own dreams inside the function body, independent
-- of how RLS is configured for RPC calls, so this never leaks another
-- user's dreams regardless of how it is invoked.
create or replace function match_dreams(
  query_embedding vector(1536),
  match_count int default 10
)
returns table (
  id uuid,
  title text,
  narrative text,
  dream_date date,
  similarity float
)
language sql
stable
as $$
  select
    dreams.id,
    dreams.title,
    dreams.narrative,
    dreams.dream_date,
    1 - (dreams.embedding <=> query_embedding) as similarity
  from dreams
  where dreams.user_id = auth.uid()
    and dreams.embedding is not null
  order by dreams.embedding <=> query_embedding
  limit match_count;
$$;
