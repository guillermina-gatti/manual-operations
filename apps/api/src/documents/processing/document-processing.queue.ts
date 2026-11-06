/**
 * Author: Guillermina Gatti
 * Summary: Enqueues document processing jobs (HU14). HU13 calls enqueue() when a
 * document version is uploaded. Jobs are deduplicated per version and retried
 * with exponential backoff.
 */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PROCESS_DOCUMENT_JOB, PROCESS_DOCUMENT_QUEUE, ProcessDocumentJob } from './processing.constants';

@Injectable()
export class DocumentProcessingQueue {
    constructor(
        @InjectQueue(PROCESS_DOCUMENT_QUEUE) private readonly queue: Queue<ProcessDocumentJob>,
    ) { }

    async enqueue(documentVersionId: string): Promise<string> {
        const job = await this.queue.add(
            PROCESS_DOCUMENT_JOB,
            { documentVersionId },
            {
                // Same version enqueued twice while still pending = one job.
                jobId: `process-${documentVersionId}`,
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: 100,
                removeOnFail: 500,
            },
        );
        return job.id!;
    }
}