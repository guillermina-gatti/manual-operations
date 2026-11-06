/**
 * Author: Guillermina Gatti
 * Summary: Unit tests for the chunker (HU14). Covers empty input, markdown
 * sections, splitting of long text and grouping of short paragraphs.
 */
import { chunkText } from './chunker';

describe('chunkText', () => {
    it('returns no chunks for blank text', () => {
        expect(chunkText('   \n\n  ')).toEqual([]);
    });

    it('uses markdown headings as section names', () => {
        const chunks = chunkText('# Returns\n\nStep one.\n\n## Refunds\n\nStep two.');

        expect(chunks).toEqual([
            { order: 0, section: 'Returns', content: 'Step one.' },
            { order: 1, section: 'Refunds', content: 'Step two.' },
        ]);
    });

    it('splits long text into pieces no larger than maxChars', () => {
        const chunks = chunkText('a'.repeat(2500), 1000);

        expect(chunks).toHaveLength(3);
        expect(chunks.every((chunk) => chunk.content.length <= 1000)).toBe(true);
    });

    it('groups short paragraphs until the limit is reached', () => {
        const chunks = chunkText(['one', 'two', 'three'].join('\n\n'), 1000);

        expect(chunks).toHaveLength(1);
    });
});