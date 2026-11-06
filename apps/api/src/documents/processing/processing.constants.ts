/**
 * Author: Guillermina Gatti
 * Summary: Constants and types for the document processing pipeline (HU14).
 * Defines the queue name, the job payload, document statuses and the
 * embedding size, which must match the vector column in the chunks table.
 */
export const PROCESS_DOCUMENT_QUEUE = 'process-document';
export const PROCESS_DOCUMENT_JOB = 'process-document';

export const DOCUMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    READY: 'ready',
    ERROR: 'error',
} as const;

export type DocumentStatus = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

export type ProcessDocumentJob = {
    documentVersionId: string;
};

// Must match the vector(768) column in the chunks table.
export const EMBEDDING_DIMENSIONS = 768;