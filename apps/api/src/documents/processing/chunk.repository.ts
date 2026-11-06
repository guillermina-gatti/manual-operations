/**
 * Author: Guillermina Gatti
 * Summary: Stores the chunks of a document version in the chunks table (HU14).
 * Replaces all chunks of a version in a single transaction, so running the
 * job again after a failure does not duplicate data.
 */
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type ChunkToStore = {
    order: number;
    section: string;
    content: string;
    embedding: number[];
    areaIds: string[];
};

@Injectable()
export class ChunkRepository {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Replaces all chunks of a version in one transaction.
     * Running it twice gives the same result, so retries never duplicate data.
     */
    async replaceForVersion(documentVersionId: string, chunks: ChunkToStore[]): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`
        DELETE FROM chunks WHERE "documentVersionId" = ${documentVersionId}::uuid`;

            for (const chunk of chunks) {
                const vector = `[${chunk.embedding.join(',')}]`;
                await tx.$executeRaw`
          INSERT INTO chunks ("id", "documentVersionId", "order", "section", "content",
                              "embedding", "areaIds", "isActive", "createdAt")
          VALUES (gen_random_uuid(), ${documentVersionId}::uuid, ${chunk.order},
                  ${chunk.section}, ${chunk.content}, ${vector}::vector,
                  ARRAY[${Prisma.join(chunk.areaIds)}]::uuid[], true, now())`;
            }
        });
    }
}