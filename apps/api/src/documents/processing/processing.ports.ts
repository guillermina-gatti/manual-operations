/**
 * Author: Guillermina Gatti
 * Summary: Interfaces the processing code depends on (HU14). The real
 * implementations come from HU13 (document upload), so this module can be
 * built and tested before that work is merged.
 */
import { DocumentStatus } from './processing.constants';

export const DOCUMENT_FILE_PORT = Symbol('DOCUMENT_FILE_PORT');
export const DOCUMENT_VERSION_PORT = Symbol('DOCUMENT_VERSION_PORT');

export interface DocumentFilePort {
    read(storageKey: string): Promise<Buffer>;
}

export type VersionForProcessing = {
    id: string;
    storageKey: string;
    mimeType: string;
    areaIds: string[];
};

export interface DocumentVersionPort {
    findForProcessing(documentVersionId: string): Promise<VersionForProcessing | null>;
    setStatus(documentVersionId: string, status: DocumentStatus, errorMessage?: string): Promise<void>;
}