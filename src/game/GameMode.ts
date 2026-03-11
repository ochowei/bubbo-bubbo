import type { BubbleType } from './boardConfig';

/** The available game modes. */
export type GameMode = 'endless' | 'timeAttack' | 'puzzle';

/** Time limit in seconds for Time Attack mode. */
export const TIME_ATTACK_DURATION = 60;

/** A single bubble placement in a puzzle layout. */
export interface PuzzleBubble {
    /** Grid column index (even for even rows, odd for odd rows). */
    i: number;
    /** Grid row index (j=0 is top). */
    j: number;
    /** Bubble type to place. */
    type: BubbleType;
}

/** A puzzle level definition. */
export interface PuzzleLevel {
    /** Target number of shots to clear in. Clearing at or under par gives a bonus. */
    par: number;
    /** Total number of rows this puzzle uses. */
    rows: number;
    /** Explicit list of bubble placements. */
    bubbles: PuzzleBubble[];
}

/**
 * Built-in puzzle levels.
 *
 * Grid reference:
 *  - j=0 is the top row (even → i = 0, 2, 4 … 24).
 *  - j=1 is the second row (odd  → i = 1, 3, 5 … 23).
 *  - Parity rule: even rows use even i; odd rows use odd i.
 */
export const PUZZLE_LEVELS: PuzzleLevel[] = [
    // Puzzle 1 — "Two Sides" (par 2)
    // Two small triangle clusters (red left, blue right).
    // Clear each with one matching shot.
    {
        par: 2,
        rows: 2,
        bubbles: [
            { i: 0, j: 0, type: 'red' },
            { i: 2, j: 0, type: 'red' },
            { i: 1, j: 1, type: 'red' },

            { i: 22, j: 0, type: 'blue' },
            { i: 24, j: 0, type: 'blue' },
            { i: 23, j: 1, type: 'blue' },
        ],
    },

    // Puzzle 2 — "Four Corners" (par 4)
    // Four independent pairs spread across the top row.
    // Each pair needs one matching shot to form a cluster of 3.
    {
        par: 4,
        rows: 1,
        bubbles: [
            { i: 0, j: 0, type: 'red' },
            { i: 2, j: 0, type: 'red' },

            { i: 8, j: 0, type: 'blue' },
            { i: 10, j: 0, type: 'blue' },

            { i: 14, j: 0, type: 'green' },
            { i: 16, j: 0, type: 'green' },

            { i: 22, j: 0, type: 'yellow' },
            { i: 24, j: 0, type: 'yellow' },
        ],
    },

    // Puzzle 3 — "Six Pack" (par 6)
    // Six pairs across the top row, two of each colour (but non-adjacent).
    // Each pair needs one shot; two per colour = 6 shots minimum.
    {
        par: 6,
        rows: 1,
        bubbles: [
            { i: 0, j: 0, type: 'red' },
            { i: 2, j: 0, type: 'red' },

            { i: 4, j: 0, type: 'blue' },
            { i: 6, j: 0, type: 'blue' },

            { i: 8, j: 0, type: 'green' },
            { i: 10, j: 0, type: 'green' },

            { i: 14, j: 0, type: 'green' },
            { i: 16, j: 0, type: 'green' },

            { i: 18, j: 0, type: 'blue' },
            { i: 20, j: 0, type: 'blue' },

            { i: 22, j: 0, type: 'red' },
            { i: 24, j: 0, type: 'red' },
        ],
    },
];
