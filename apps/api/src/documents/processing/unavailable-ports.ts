/**
 * Author: Guillermina Gatti
 * Summary: Temporary adapters for the processing ports (HU14). They fail
 * with a clear message until HU13 provides the real storage and
 * document_versions access. Jobs retry, so nothing is lost meanwhile.
 */
import { Injectable } from '@nestjs/common';
import { DocumentFilePort, DocumentVersionPort, VersionForProcessing } from './processing.ports';
import { DocumentStatus } from './processing.constants';

const NOT_CONNECTED = 'Document adapter not connected yet (depends on HU13)';

@Injectable()
export class UnavailableDocumentFilePort implements DocumentFilePort {
    async read(): Promise<Buffer> {
        throw new Error(NOT_CONNECTED);
    }
}

@Injectable()
export class UnavailableDocumentVersionPort implements DocumentVersionPort {
    async findForProcessing(): Promise<VersionForProcessing | null> {
        throw new Error(NOT_CONNECTED);
    }

    async setStatus(_id: string, _status: DocumentStatus): Promise<void> {
        throw new Error(NOT_CONNECTED);
    }
}