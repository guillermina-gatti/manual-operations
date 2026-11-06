/**
 * Author: Guillermina Gatti
 * Summary: Splits extracted text into chunks for embedding (HU14).
 * Paragraphs are grouped up to a maximum size, and markdown headings
 * start a new section that is stored with each chunk.
 */
export type TextChunk = {
    order: number;
    section: string;
    content: string;
};

export const DEFAULT_MAX_CHARS = 1200;
const DEFAULT_SECTION = 'Introduction';
const HEADING_PATTERN = /^#{1,6}\s+(.+)$/;

/**
 * Splits text into chunks, grouping paragraphs up to maxChars.
 * Markdown headings (# Title) start a new section and are not part of the content.
 */
export function chunkText(raw: string, maxChars = DEFAULT_MAX_CHARS): TextChunk[] {
    const chunks: TextChunk[] = [];
    let section = DEFAULT_SECTION;
    let buffer = '';

    const flush = () => {
        const content = buffer.trim();
        if (content.length > 0) {
            chunks.push({ order: chunks.length, section, content });
        }
        buffer = '';
    };

    const paragraphs = raw.replace(/\r\n/g, '\n').split(/\n\s*\n/);

    for (const paragraph of paragraphs) {
        const text = paragraph.trim();
        if (!text) continue;

        const heading = text.match(HEADING_PATTERN);
        if (heading && !text.includes('\n')) {
            flush();
            section = heading[1].trim();
            continue;
        }

        for (const piece of splitLongParagraph(text, maxChars)) {
            if (buffer && buffer.length + piece.length + 2 > maxChars) {
                flush();
            }
            buffer = buffer ? `${buffer}\n\n${piece}` : piece;
        }
    }

    flush();
    return chunks;
}

function splitLongParagraph(text: string, maxChars: number): string[] {
    if (text.length <= maxChars) return [text];

    const parts: string[] = [];
    for (let i = 0; i < text.length; i += maxChars) {
        parts.push(text.slice(i, i + maxChars));
    }
    return parts;
}