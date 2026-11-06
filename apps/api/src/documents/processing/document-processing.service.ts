/**
 * Author: Guillermina Gatti
 * Summary: Core of the document processing job (HU14). Reads the file, extracts
 * text, splits it into chunks, generates embeddings and stores them, updating
 * the version status along the way.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UnrecoverableError } from 'bullmq';
import { chunkText } from './chunker';
import { ChunkRepository } from './chunk.repository';
import { DOCUMENT_STATUS } from './processing.constants';
import { DOCUMENT_FILE_PORT, DOCUMENT_VERSION_PORT, DocumentFilePort, DocumentVersionPort } from './processing.ports';
import { EmbeddingService } from './embedding.service';
import { extractText } from './text-extractor';

@Injectable()
export class DocumentProcessingService {
    private readonly logger = new Logger(DocumentProcessingService.name);

    constructor(
        @Inject(DOCUMENT_FILE_PORT) private readonly files: DocumentFilePort,
        @Inject(DOCUMENT_VERSION_PORT) private readonly versions: DocumentVersionPort,
        private readonly chunks: ChunkRepository,
        private readonly embeddings: EmbeddingService,
    ) { }

    async process(documentVersionId: string): Promise<void> {
        const version = await this.versions.findForProcessing(documentVersionId);
        if (!version) {
            throw new UnrecoverableError(`Document version ${documentVersionId} not found`);
        }

        await this.versions.setStatus(documentVersionId, DOCUMENT_STATUS.PROCESSING);

        const file = await this.files.read(version.storageKey);
        const text = await extractText(file, version.mimeType);
        const pieces = chunkText(text);

        if (pieces.length === 0) {
            throw new UnrecoverableError('The document has no extractable text (scanned PDF?)');
        }

        const vectors = await this.embeddings.embedAll(pieces.map((piece) => piece.content));

        await this.chunks.replaceForVersion(
            documentVersionId,
            pieces.map((piece, i) => ({ ...piece, embedding: vectors[i], areaIds: version.areaIds })),
        );

        await this.versions.setStatus(documentVersionId, DOCUMENT_STATUS.READY);
        this.logger.log(`Processed ${documentVersionId}: ${pieces.length} chunks`);
    }

    async markError(documentVersionId: string, message: string): Promise<void> {
        await this.versions.setStatus(documentVersionId, DOCUMENT_STATUS.ERROR, message);
    }
}