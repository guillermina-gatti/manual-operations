/**
 * Author: Guillermina Gatti
 * Summary: Wires the document processing pipeline (HU14): BullMQ queue and
 * worker, chunk storage, embeddings, and temporary adapters for the ports
 * that HU13 will replace.
 */
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PROCESS_DOCUMENT_QUEUE } from './processing.constants';
import { DOCUMENT_FILE_PORT, DOCUMENT_VERSION_PORT } from './processing.ports';
import { ChunkRepository } from './chunk.repository';
import { DocumentProcessingProcessor } from './document-processing.processor';
import { DocumentProcessingQueue } from './document-processing.queue';
import { DocumentProcessingService } from './document-processing.service';
import { EmbeddingService } from './embedding.service';
import { UnavailableDocumentFilePort, UnavailableDocumentVersionPort } from './unavailable-ports';

@Module({
    imports: [
        BullModule.forRootAsync({
            useFactory: () => {
                const url = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');
                return {
                    connection: { host: url.hostname, port: Number(url.port || 6379) },
                };
            },
        }),
        BullModule.registerQueue({ name: PROCESS_DOCUMENT_QUEUE }),
    ],
    providers: [
        DocumentProcessingService,
        DocumentProcessingProcessor,
        DocumentProcessingQueue,
        ChunkRepository,
        EmbeddingService,
        { provide: DOCUMENT_FILE_PORT, useClass: UnavailableDocumentFilePort },
        { provide: DOCUMENT_VERSION_PORT, useClass: UnavailableDocumentVersionPort },
    ],
    exports: [DocumentProcessingQueue],
})
export class ProcessingModule { }