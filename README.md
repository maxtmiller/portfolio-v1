# portfolio-v1

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white) ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat&logo=langchain&logoColor=white)

**Personal portfolio site with an adaptive RAG chatbot that answers questions about my experience and projects. Retired in favor of a newer portfolio — pipeline preserved here for reference.**

---

## RAG Pipeline

The chat widget ("Proxy AI") is backed by a LangChain pipeline that routes queries through different retrieval strategies depending on complexity.

### Architecture

```
User Query
    │
    ▼
Condense Question (if conversation history exists)
    │
    ▼
Query Classification → "simple" or "complex"
    │
    ├── simple ──→ k-chunk vector retrieval → LLM
    │
    └── complex ─→ Step-back prompting  ─┐
                   Query decomposition   ├─→ Multi-context fusion → LLM
                   Query rephrasing     ─┘
```

**Complex path** — three techniques run in parallel before generation:

- **Step-back prompting** ([Zheng et al., 2023](https://arxiv.org/pdf/2310.06117)) — rephrases the query to a more abstract form, retrieves on both the original and abstracted versions, then deduplicates and merges the chunks.
- **Query decomposition** ([Zhou et al., 2022](https://arxiv.org/pdf/2205.10625)) — breaks the question into 3 sub-questions, retrieves context for each in parallel, and builds an iterative Q&A chain where each answer informs the next.
- **Query rephrasing** ([Ma et al., 2023](https://arxiv.org/pdf/2311.04205)) — expands the original question before retrieval to improve embedding alignment.

### Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, TypeScript |
| Orchestration | LangChain |
| Vector store | Pinecone |
| Embeddings | OpenAI `text-embedding-3-small` |
| Generation | OpenAI `gpt-4o-mini` |
| Cache | Redis Cloud (vector index) |
| Rate limiting | Upstash |
| Tracing | LangSmith |

### Key files

```
app/api/chat/route.ts              — main RAG chain and routing logic
app/api/chat/queryTranslations.ts  — step-back, decomposition, rephrasing
app/api/trace/route.ts             — LangSmith trace fetching
lib/redis.ts                       — Redis client and vector cache setup
components/chat.tsx                — chat UI with trace view and settings
```

## Development

```bash
npm install
npm run dev
```

Requires a `.env` file with `OPENAI_API_KEY`, `PINECONE_API_KEY`, `REDIS_PASSWORD`, `REDIS_ENDPOINT`, `REDIS_PORT`, and `LANGCHAIN_API_KEY`.
