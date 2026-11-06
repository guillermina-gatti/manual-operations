/**
 * Author: Guillermina Gatti
 * Summary: Extracts plain text from uploaded files (HU14). Supports PDF,
 * TXT and Markdown. Unsupported types fail immediately, without retries.
 */
import { UnrecoverableError } from 'bullmq';
import pdfParse = require('pdf-parse');

const PLAIN_TEXT_TYPES = ['text/plain', 'text/markdown'];

export async function extractText(file: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
        const result = await pdfParse(file);
        return result.text;
    }

    if (PLAIN_TEXT_TYPES.includes(mimeType)) {
        return file.toString('utf8');
    }

    // Retrying will not change the file type, so the job fails right away.
    throw new UnrecoverableError(`Unsupported file type: ${mimeType}`);
}