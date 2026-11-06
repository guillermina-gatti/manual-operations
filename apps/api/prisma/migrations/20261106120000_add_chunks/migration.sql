-- Ensures pgvector exists even in the shadow database Prisma creates for validation.
CREATE EXTENSION IF NOT EXISTS vector;

-- Author: Guillermina Gatti. Summary: creates the chunks table with a pgvector
-- column and an HNSW index for cosine search (HU14).

-- CreateTable
CREATE TABLE "chunks" (
    "id" UUID NOT NULL,
    "documentVersionId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "areaIds" UUID[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chunks_documentVersionId_idx" ON "chunks"("documentVersionId");

-- CreateIndex (HNSW for cosine search; Prisma cannot express it in schema.prisma)
CREATE INDEX "chunks_embedding_hnsw_idx" ON "chunks" USING hnsw ("embedding" vector_cosine_ops);