import type { BubbleType } from '../boardConfig';
import level1 from '../data/puzzle-level-1.json';

export interface PuzzleLevelData {
    lines: (BubbleType | null)[][];
    shotSequence: BubbleType[];
    parShots: number;
}

/** Lookup map from level id to raw JSON data. */
const LEVEL_DATA: Record<number, PuzzleLevelData> = {
    1: level1 as PuzzleLevelData,
};

/**
 * Load a puzzle level by ID.
 * Validates the structure at runtime:
 *   - even-index rows (0, 2, 4, …) must have ≤ 13 entries
 *   - odd-index rows  (1, 3, 5, …) must have ≤ 12 entries
 * @param id - 1-indexed level identifier.
 * @returns The validated `PuzzleLevelData` object.
 */
export function loadPuzzleLevel(id: number): PuzzleLevelData {
    const raw = LEVEL_DATA[id];

    if (!raw) {
        throw new Error(`loadPuzzleLevel: no data found for level ${id}`);
    }

    raw.lines.forEach((row, j) => {
        const maxItems = j % 2 === 0 ? 13 : 12;

        if (row.length > maxItems) {
            throw new Error(`puzzle-level-${id}.json: row ${j} has ${row.length} items but the maximum is ${maxItems}`);
        }
    });

    if (!raw.shotSequence || raw.shotSequence.length === 0) {
        throw new Error(`puzzle-level-${id}.json: shotSequence must be a non-empty array`);
    }

    if (typeof raw.parShots !== 'number' || raw.parShots < 1) {
        throw new Error(`puzzle-level-${id}.json: parShots must be a positive number`);
    }

    return raw;
}
