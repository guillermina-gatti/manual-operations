/**
 * Author: Guillermina Gatti
 * Summary: BullMQ worker for document processing (HU14). Runs the processing
 * service for each job and marks the version as error when retries run out
 * or the failure cannot be retried.
 */
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, UnrecoverableError } from 'bullmq';
import { DocumentProcessingService } from './document-processing.service';
import { PROCESS_DOCUMENT_QUEUE, ProcessDocumentJob } from './processing.constants';

@Processor(PROCESS_DOCUMENT_QUEUE, {
    concurrency: 2,
    // Poll Redis less often: Upstash free tier counts every command (see report, section 5.4).
    drainDelay: 30,
})
export class DocumentProcessingProcessor extends WorkerHost {
    private readonly logger = new Logger(DocumentProcessingProcessor.name);

    constructor(private readonly service: DocumentProcessingService) {
        super();
    }

    async process(job: Job<ProcessDocumentJob>): Promise<void> {
        await this.service.process(job.data.documentVersionId);
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job<ProcessDocumentJob> | undefined, error: Error): Promise<void> {
        if (!job) return;

        const attemptsExhausted = job.attemptsMade >= (job.opts.attempts ?? 1);
        if (!attemptsExhausted && !(error instanceof UnrecoverableError)) return;

        try {
            await this.service.markError(job.data.documentVersionId, error.message);
        } catch (markErr) {
            this.logger.error(`Could not mark version ${job.data.documentVersionId} as error`, markErr);
        }
    }
}