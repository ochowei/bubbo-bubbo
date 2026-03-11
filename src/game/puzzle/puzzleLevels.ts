import type { PuzzleLevel } from './types';

/**
 * Static puzzle level definitions.
 *
 * Grid coordinate conventions (matching the board engine):
 *   - `grid[0]` = row j=0 (bottom of the board).
 *   - Higher indices = rows closer to the ceiling.
 *   - Even rows (j=0,2,…) hold up to 13 bubbles; odd rows (j=1,3,…) hold up to 12.
 *   - Each inner-array element maps sequentially to the valid `i` slots for that row:
 *       even row → i = 0, 2, 4, …, 24   (element index 0→i 0, 1→i 2, …)
 *       odd row  → i = 1, 3, 5, …, 23   (element index 0→i 1, 1→i 3, …)
 *   - `null` = empty cell.
 *
 * Level design goals
 *   1 – Tutorial: basic colour-matching, straightforward clusters.
 *   2 – Tutorial: multi-cluster clear with a deliberate chain drop.
 *   3 – Intermediate: tighter layout that rewards efficient colour sequencing.
 */
export const puzzleLevels: PuzzleLevel[] = [
    // -------------------------------------------------------------------------
    // Level 1 — "Three-Colour Starter"
    // Goal  : 3 clear shots, one per colour cluster.
    // Layout:
    //   row 2 (ceiling, even, 13): R  G  B  -  -  -  -  -  -  -  -  -  -
    //   row 1 (odd, 12)          : R  R  G  G  B  B  -  -  -  -  -  -
    //   row 0 (bottom, even, 13) : R  R  R  G  G  G  B  B  B  -  -  -  -
    //
    // Shooting one red into the red cluster pops all 6 connected reds (rows 0–2).
    // The now-orphaned greens and blues in rows 0–1 fall off.
    // Repeat for green and blue → 3-shot clear.
    // -------------------------------------------------------------------------
    {
        levelId: 1,
        grid: [
            // row j=0  (even → 13 cells, first 9 used)
            ['red', 'red', 'red', 'green', 'green', 'green', 'blue', 'blue', 'blue', null, null, null, null],
            // row j=1  (odd  → 12 cells, first 6 used)
            ['red', 'red', 'green', 'green', 'blue', 'blue', null, null, null, null, null, null],
            // row j=2  (even → 13 cells, first 3 used — ceiling anchor)
            ['red', 'green', 'blue', null, null, null, null, null, null, null, null, null, null],
        ],
        queue: ['red', 'green', 'blue', 'red', 'green', 'blue', 'red', 'green', 'blue'],
        parShots: 3,
        allowedSpecials: false,
    },

    // -------------------------------------------------------------------------
    // Level 2 — "Chain Drop"
    // Goal  : 4 shots; shooting the top anchor rows causes a cascade drop.
    // Layout:
    //   row 3 (ceiling, odd,  12): R  G  B  Y  -  -  -  -  -  -  -  -
    //   row 2 (even, 13)         : R  R  G  G  B  B  Y  Y  -  -  -  -  -
    //   row 1 (odd,  12)         : R  G  B  Y  R  G  B  Y  -  -  -  -
    //   row 0 (bottom, even, 13) : R  R  G  G  B  B  Y  Y  R  -  -  -  -
    //
    // The even ceiling row keeps each colour cluster anchored.
    // Popping the ceiling anchor of a colour orphans the rows below it.
    // Strategy: shoot 4 different colours at the 4 ceiling anchors in sequence.
    // -------------------------------------------------------------------------
    {
        levelId: 2,
        grid: [
            // row j=0  (even → 13 cells, first 9 used)
            ['red', 'red', 'green', 'green', 'blue', 'blue', 'yellow', 'yellow', 'red', null, null, null, null],
            // row j=1  (odd  → 12 cells, first 8 used)
            ['red', 'green', 'blue', 'yellow', 'red', 'green', 'blue', 'yellow', null, null, null, null],
            // row j=2  (even → 13 cells, first 8 used)
            ['red', 'red', 'green', 'green', 'blue', 'blue', 'yellow', 'yellow', null, null, null, null, null],
            // row j=3  (odd  → 12 cells, first 4 used — ceiling anchor)
            ['red', 'green', 'blue', 'yellow', null, null, null, null, null, null, null, null],
        ],
        queue: ['red', 'green', 'blue', 'yellow', 'red', 'green', 'blue', 'yellow'],
        parShots: 4,
        allowedSpecials: false,
    },

    // -------------------------------------------------------------------------
    // Level 3 — "Colour Pyramid"
    // Goal  : 5 shots; a compact pyramid where clearing the peak collapses layers.
    // Specials allowed so a bomb bubble can be used strategically.
    // Layout:
    //   row 4 (ceiling, even, 13): R  -  -  -  -  -  -  -  -  -  -  -  -
    //   row 3 (odd,  12)         : R  R  -  -  -  -  -  -  -  -  -  -
    //   row 2 (even, 13)         : R  G  G  -  -  -  -  -  -  -  -  -  -
    //   row 1 (odd,  12)         : G  G  G  B  -  -  -  -  -  -  -  -
    //   row 0 (bottom, even, 13) : G  G  B  B  B  -  -  -  -  -  -  -  -
    //
    // Shoot red to clear the top 3 rows, then 2 shots for greens and 2 for blues.
    // Par 5: R(×1 to pop peak) → G(×2) → B(×2).
    // -------------------------------------------------------------------------
    {
        levelId: 3,
        grid: [
            // row j=0  (even → 13 cells, first 5 used)
            ['green', 'green', 'blue', 'blue', 'blue', null, null, null, null, null, null, null, null],
            // row j=1  (odd  → 12 cells, first 4 used)
            ['green', 'green', 'green', 'blue', null, null, null, null, null, null, null, null],
            // row j=2  (even → 13 cells, first 3 used)
            ['red', 'green', 'green', null, null, null, null, null, null, null, null, null, null],
            // row j=3  (odd  → 12 cells, first 2 used)
            ['red', 'red', null, null, null, null, null, null, null, null, null, null],
            // row j=4  (even → 13 cells, first 1 used — ceiling anchor)
            ['red', null, null, null, null, null, null, null, null, null, null, null, null],
        ],
        queue: ['red', 'green', 'blue', 'green', 'blue', 'red', 'green', 'blue'],
        parShots: 5,
        allowedSpecials: true,
    },
];
