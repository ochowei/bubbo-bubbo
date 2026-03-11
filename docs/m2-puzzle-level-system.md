# M2 — LevelSystem Puzzle 化：固定版圖與出球序列

## 目標

Puzzle 模式下，同一關卡每次進入的盤面與出球序列完全一致，且遊戲過程中不會新增任何隨機泡泡。

---

## 架構分析

### 需要改動的三個關鍵點

| 位置 | 現行行為 | Puzzle 模式需求 |
|------|---------|----------------|
| `LevelSystem.createLevel()` (line 190) | 呼叫 `addLine()` N 次，每次隨機選型別 | 從固定 JSON 資料建盤面 |
| `LevelSystem.setBubble()` (line 561-564) | 第一球命中後啟動 `addLineToGridTop()` 遞迴 | 阻斷遞迴，不新增列 |
| `CannonSystem._newBubble()` (line 283) | 依 `countPerType` 頻率隨機產生 | 從固定序列依序取值 |

### 不需要重構的理由

- `game.mode` 屬性已存在（`Game.ts` line 39），只需在三處加判斷
- `_allowNewLine` 機制已足夠控制列新增，阻斷入口後遞迴自動失效
- 現有 `_createGridBubble()` 與 pool 機制可直接複用
- 不需新增 System，不需修改 `Game.ts`

---

## 六角格座標說明

```
偶數列（j=0,2,4...）：13 個格子，slot 0-12 → gridI = slot * 2       (0,2,4,...,24)
奇數列（j=1,3,5...）：12 個格子，slot 0-11 → gridI = slot * 2 + 1   (1,3,5,...,23)
```

---

## 任務清單

### M2.1 — 定義關卡資料格式，建立 `puzzle-level-1.json`

**新增檔案：** `src/game/data/puzzle-level-1.json`

**格式：**
```json
{
  "lines": [
    ["red","blue","green",null,"red","blue","green",null,"red","blue","green",null,"red"],
    [null,"blue","green","red",null,"blue","green","red",null,"blue","green","red"],
    ...
  ],
  "shotSequence": ["red","blue","green","red","blue","green",...]
}
```

- `lines[0]` = 最頂列（j=0），往下排列
- 偶數 index 列：13 項；奇數 index 列：12 項
- `null` 表示該格為空
- `shotSequence` 僅包含 regular bubble types（`red`/`green`/`blue`/`yellow`）

**驗證：** JSON 格式合法；偶數列 ≤13 項，奇數列 ≤12 項；`npm run types` 無錯誤。

---

### M2.2 — 建立 TypeScript 型別定義與載入器

**新增檔案：** `src/game/puzzle/PuzzleLevel.ts`

```ts
import type { BubbleType } from '../boardConfig';

export interface PuzzleLevelData {
    lines: (BubbleType | null)[][];
    shotSequence: BubbleType[];
}

export function loadPuzzleLevel(id: number): PuzzleLevelData { ... }
```

載入器直接 `import` JSON，並在 runtime 驗證結構正確性（偶數列不超過 13 項、奇數列不超過 12 項）。

**驗證：** `npm run types` 無 TS 錯誤；呼叫 `loadPuzzleLevel(1)` 回傳物件結構符合介面。

---

### M2.3 — 修改 `LevelSystem` 支援固定版圖

**修改檔案：** `src/game/systems/LevelSystem.ts`

新增公開屬性供 CannonSystem 使用：
```ts
public puzzleShotSequence: BubbleType[] = [];
```

修改 `createLevel()`，加入 mode 分支：
```ts
public createLevel() {
    if (this.game.mode === 'puzzle') {
        const data = loadPuzzleLevel(1);
        this._createPuzzleLevel(data);
    } else {
        const count = this.startingLines;
        for (let l = 0; l < count; l++) this.addLine();
    }
    // 以下保持不變（alpha、y offset、updatePosRatio）
    const count = this.lines.length;
    this._gridContainer.alpha = 0;
    this._gridContainer.y = -count * boardConfig.bubbleSize;
    this.lines.forEach((line) => line.updatePosRatio(1));
}
```

新增私有方法 `_createPuzzleLevel(data)`：
```ts
private _createPuzzleLevel(data: PuzzleLevelData) {
    this.puzzleShotSequence = data.shotSequence;
    for (let j = 0; j < data.lines.length; j++) {
        const even = j % 2 === 0;
        const line = pool.get(BubbleLine);
        line.init(j, this.game, even);
        line.y = boardConfig.screenTop + boardConfig.bubbleSize * j;
        this.lines.push(line);
        const startingI = even ? 0 : 1;
        data.lines[j].forEach((type, slot) => {
            if (!type) return;
            const i = startingI + slot * 2;
            const bubble = this._createGridBubble(type, i, j);
            line.addBubble(bubble, this.calculateBubbleX(bubble));
            this._gridContainer.addChild(bubble.view);
        });
    }
}
```

`reset()` 中需清空序列：
```ts
this.puzzleShotSequence = [];
```

**驗證：** Puzzle 模式重啟兩次，視覺盤面完全一致；Endless 模式盤面仍隨機。

---

### M2.4 — 關閉 Puzzle 模式的動態新增列

**修改檔案：** `src/game/systems/LevelSystem.ts`，`setBubble()` 方法 (line ~561)

```ts
// 原本
if (!this._allowNewLine) {
    this._allowNewLine = true;
    this.addLineToGridTop();
}

// 改為
if (!this._allowNewLine && this.game.mode !== 'puzzle') {
    this._allowNewLine = true;
    this.addLineToGridTop();
}
```

`_allowNewLine` 在 puzzle 模式永遠不會被設為 `true`，因此第 262 行的遞迴呼叫也自動失效，無需另外修改。

**驗證：** Puzzle 模式連射 10 球以上，盤面不出現新列；Endless 模式新列仍正常出現。

---

### M2.5 — CannonSystem 使用固定出球序列

**修改檔案：** `src/game/systems/CannonSystem.ts`

新增 property：
```ts
private _puzzleShotIndex = 0;
```

`reset()` 中新增：
```ts
this._puzzleShotIndex = 0;
```

修改 `_newBubble()`，在方法最前面加入 puzzle 分支：
```ts
private _newBubble() {
    if (this.game.mode === 'puzzle') {
        const seq = this.game.systems.get(LevelSystem).puzzleShotSequence;
        return seq[this._puzzleShotIndex++ % seq.length];
    }
    // ... 以下維持原有隨機邏輯不變
}
```

**驗證：** Puzzle 模式下，兩次遊戲的出球顏色順序與 `shotSequence` 完全一致；Endless 模式出球仍為隨機。

---

## 任務依賴關係

```
M2.1 (puzzle-level-1.json)
    └─► M2.2 (型別 + 載入器)
            └─► M2.3 (LevelSystem 固定版圖) ──► M2.5 (CannonSystem 固定序列)
M2.4 (關閉新增列) — 獨立，可與 M2.3 並行
```

## 完成標準

1. `src/game/data/puzzle-level-1.json` 存在且格式正確
2. Puzzle 模式下，每次進入盤面與出球序列完全一致
3. Puzzle 模式下，射球不觸發新列新增
4. Endless / Time-Attack 模式行為完全不受影響
5. `npm run types` 與 `npm run lint:fix` 通過
