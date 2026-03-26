import type { BubbleType } from '../boardConfig';

/**
 * Represents a single puzzle level configuration.
 *
 * Grid layout notes:
 * - `grid[0]` is the bottom-most row (j=0), `grid[n-1]` is the top-most row.
 * - Even rows (j=0,2,4,...) contain up to 13 cells (mapped to board i=0,2,...,24).
 * - Odd rows  (j=1,3,5,...) contain up to 12 cells (mapped to board i=1,3,...,23).
 * - Use `null` to leave a cell empty.
 */
export interface PuzzleLevel {
    /** Unique identifier for this puzzle level (1-indexed). */
    levelId: number;

    /**
     * 2-D array describing the fixed bubble layout.
     * Outer index = row j (0 = bottom), inner index = column position.
     * `null` means no bubble in that cell.
     */
    grid: (BubbleType | null)[][];

    /**
     * Optional fixed shot queue for the cannon.
     * When provided, M2 will feed these types to the cannon in order instead of
     * generating them randomly.
     */
    queue?: BubbleType[];

    /** Theoretical minimum number of shots needed to clear the level (par). */
    parShots: number;

    /**
     * Whether special bubbles (bomb / super / timer) are allowed on the board.
     * When `false`, M2 must filter out specials during grid initialisation.
     */
    allowedSpecials: boolean;
}
