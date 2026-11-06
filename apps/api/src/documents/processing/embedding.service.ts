/**
 * Author: Guillermina Gatti
 * Summary: Generates embeddings for text chunks with Gemini through the
 * Vercel AI SDk (HU14). Sends texts in batches and fixes the output size
 * to 768 dimensions so vectors match the chunks table.
 */
import { Injectable } from '@nestjs/common';
import { google } from '@ai-sdk/google';
import { embedMany } from 'ai';
import { EMBEDDING_DIMENSIONS } from './processing.constants';

const BATCH_SIZE = 50;

@Injectable()
export class EmbeddingService {
    private readonly model = google.textEmbeddingModel(
        process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001',
    );

    async embedAll(texts: string[]): Promise<number[][]> {
        const vectors: number[][] = [];

        for (let i = 0; i < texts.length; i += BATCH_SIZE) {
            const { embeddings } = await embedMany({
                model: this.model,
                values: texts.slice(i, i + BATCH_SIZE),
                providerOptions: {
                    google: { outputDimensionality: EMBEDDING_DIMENSIONS },
                },
            });
            vectors.push(...embeddings);
        }

        return vectors;
    }
}