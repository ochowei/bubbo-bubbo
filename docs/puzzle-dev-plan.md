# Puzzle 模式開發計劃

> **目標**：在不重寫核心物理的前提下，為 Bubbo Bubbo 新增固定關卡的 Puzzle 模式，支援最少步數（Par）評分。

---

## 里程碑總覽

| 里程碑 | 內容 | 預估天數 | 狀態 |
|--------|------|----------|------|
| M1 | 規格定義與資料模型 | 1 天 | ✅ 完成 |
| M2 | LevelSystem puzzle 化 | 2 天 | ✅ 完成 |
| M3 | 發射次數與 Par 判定 | 1~2 天 | ⬅️ 下一步 |
| M4 | 通關／失敗條件 | 1~2 天 | 待辦 |
| M5 | UI/UX | 1~2 天 | 待辦 |
| M6 | 測試與關卡內容生產 | 2 天+ | 待辦 |

---

## M1 — 規格定義與資料模型（1 天）

**目標**：定義 puzzle 的「可配置關卡格式」與「勝負判定資料結構」。

### 關卡資料結構

```ts
// src/game/puzzle/types.ts
interface PuzzleLevel {
  levelId: number;
  grid: BubbleType[][];          // 固定泡泡排布，空格用 null
  queue?: BubbleType[];          // 可選：固定出球序列
  parShots: number;              // 理論最少步數
  allowedSpecials: boolean;      // 是否允許 bomb/super/timer
}
```

### 新增檔案

- `src/game/puzzle/types.ts` — 型別定義
- `src/game/puzzle/puzzleLevels.ts` — 靜態關卡資料（JSON-like）

### 注意事項

- `queue` 為選填；若填寫，需在 M2 修改 `CannonSystem._generateNextBubble()` 讀取固定序列而非隨機產生
- `allowedSpecials: false` 時，LevelSystem 的 special bubble 生成邏輯需濾除 bomb/super/timer

### 驗收標準

- [x] `PuzzleLevel` 型別能保證每關資料完整且合法（行列數、bubble type 合法值）
- [x] TypeScript 編譯無型別錯誤
- [x] 至少填入 3 筆測試用關卡資料

---

## M2 — LevelSystem Puzzle 化（2 天）✅ 完成

**目標**：Puzzle 模式走固定版圖，關閉動態新增行。

### 修改範圍

**`src/game/systems/LevelSystem.ts`**

- `start()` 或 `createLevel()` 增加 `if (game.mode === 'puzzle')` 分支
  - 讀取 `puzzleLevels[levelId]`
  - 以關卡 `grid` 逐格呼叫 `setBubble(...)`
  - 設定 `_allowNewLine = false`（已存在此 flag，直接使用）
  - 若 `allowedSpecials === false`，跳過 special bubble 的隨機生成

**`src/game/systems/CannonSystem.ts`**（若使用 `queue`）

- `_generateNextBubble()` 增加分支：若 puzzle 模式有固定 `queue`，依序讀取而非隨機加權

### 不改動項目

- 碰撞、消除、掉落物理邏輯（保持原樣）
- 非 puzzle 模式的 LevelSystem 行為（保持原樣）

### 驗收標準

- [x] 同一關卡 ID 每次進入都呈現相同版圖與開局泡泡
- [x] 非 puzzle 模式行為不受影響
- [x] 若 `allowedSpecials: false`，格子內確實無 special bubble

---

## M3 — 發射次數與 Par 判定（1~2 天）⬅️ 下一步

**目標**：建立 puzzle 模式核心 KPI。

### 修改範圍

**`src/game/Stats.ts`**

新增欄位：

```ts
shotsFired: number;   // 本局合法發射次數（含未消泡的射擊）
levelId: number;      // 當前 puzzle 關卡 ID
parShots: number;     // 從關卡資料帶入的理論最少步數
```

**`src/game/systems/CannonSystem.ts`**

- `_fire()` 每次合法發射時累計 `game.stats.shotsFired++`

### 評分計算（結算時）

```ts
const usedShots = game.stats.shotsFired;
const isParOrBetter = usedShots <= game.stats.parShots;

// 星級建議
// 3 星：usedShots <= parShots
// 2 星：usedShots === parShots + 1
// 1 星：其餘（有清場但超過 par+1）
```

### 驗收標準

- [ ] `shotsFired` 在每次合法發射後正確遞增
- [ ] `isParOrBetter` 邏輯正確（含邊界值）
- [ ] 重玩同一關時 `shotsFired` 正確重置

---

## M4 — 通關／失敗條件（1~2 天）

**目標**：Puzzle 模式有獨立的結束條件，與 endless/time-attack 行為隔離。

### 通關條件

以 `_bubbleMap`（LevelSystem 的格子資料結構）為單一判定來源：

- 當 `_bubbleMap` 中無任何存活 bubble 時，視為清場成功
- **不使用畫面物件數量判定**（避免動畫中間態誤觸發）

### 失敗條件（建議明確選定其一，避免設計搖擺）

> **建議選擇 Option A**，先以純益智體驗為主，後期可升級為 B。

- **Option A（無失敗）**：只要清場即通關，純比最少步；無法清場可無限嘗試
- **Option B（有上限）**：設 `maxShots`（例如 `parShots * 2`），超過即失敗

### 修改範圍

**`src/game/systems/LevelSystem.ts`**

- 每次消除後檢查 `_bubbleMap` 是否清空，觸發 `signals.onPuzzleClear`

**`src/game/Game.ts`**

- 監聽 `signals.onPuzzleClear`，呼叫 `gameOver()` 並傳遞 puzzle 結果欄位

**`src/screens/ResultScreen.ts`**

- 接收並顯示 `usedShots`、`parShots`、`isClear`、星級

### 驗收標準

- [ ] 清場時正確觸發通關並進入結果頁
- [ ] 未清場時不誤觸發通關
- [ ] Option A/B 選定後，行為符合設計文件

---

## M5 — UI/UX（1~2 天）

**目標**：玩家在遊戲中與結算頁都能看懂 puzzle 目標。

### HUD 修改（`src/game/systems/HudSystem.ts`）

- Puzzle 模式顯示發射步數：`SHOTS: x / PAR: y`
- Puzzle 模式隱藏 time-attack 倒數計時（目前非 time-attack 已隱藏，可沿用現有 `_isTimeAttack` 判斷）
- 模式標題顯示「Puzzle」（沿用現有 mode title 機制）

### 結果頁修改（`src/screens/ResultScreen.ts`）

新增 puzzle 專區（puzzle 模式才顯示）：

```
Used Shots: 12 / Par: 10
Rating: ⭐⭐⭐  /  ⭐⭐  /  ⭐
```

### 模式說明（`src/screens/ModeSelectionScreen.ts`）

- Puzzle 說明文案補強：「固定關卡，挑戰最少步清場」或類似描述

### 驗收標準

- [ ] HUD 在 puzzle 模式正確顯示步數與 par 值
- [ ] HUD 在 puzzle 模式不顯示倒數計時
- [ ] 結果頁正確顯示 puzzle 評分區塊（非 puzzle 模式不顯示）
- [ ] ModeSelection 有清楚的 puzzle 模式說明

---

## M6 — 測試與關卡內容生產（2 天+）

**目標**：確保品質，並建立可持續擴充的關卡內容。

### 最低測試集合

- [ ] 關卡資料 schema 驗證（每筆 `PuzzleLevel` 型別合法）
- [ ] `shotsFired` 統計一致性（多次遊玩、重玩結果一致）
- [ ] 清場判定（完整清空、部分殘留皆測試）
- [ ] Par 評分邊界值（剛好 par、par+1、par+2）
- [ ] 模式隔離（切換至 endless/time-attack 後 puzzle 相關狀態已重置）

### 初始關卡規劃（10 關）

| 關卡 | 類型 | 設計目標 |
|------|------|---------|
| 1–3 | 教學關 | 基本消除、顏色辨識 |
| 4–8 | 進階關 | 牆反彈、連鎖消除 |
| 9–10 | 挑戰關 | special bubble 運用、高難連鎖 |

### 關卡內容生產流程

- [ ] 設計 10 關關卡資料並填入 `puzzleLevels.ts`
- [ ] 每關標注設計目標（學牆反彈、學 special、學連鎖）
- [ ] 人工遊玩驗證每關的 `parShots` 值合理可達

---

## 技術風險與對策

| 風險 | 對策 |
|------|------|
| **勝利判定不穩**（動畫中間態誤觸發） | 以 `_bubbleMap` 資料結構為單一判定來源，不依賴畫面物件數量 |
| **score 與 puzzle 指標混淆** | Puzzle 模式主要 KPI 改為 shots/par，score 視為次要資訊 |
| **模式分支擴散** | 集中在 `LevelSystem`／`HudSystem`／`ResultScreen`，避免所有 system 到處散落 `if puzzle` |
| **`queue` 功能增加 CannonSystem 複雜度** | `queue` 標記為 optional，先不實作，視需求後期再加 |

---

## 檔案修改影響範圍

```
新增：
  src/game/puzzle/types.ts
  src/game/puzzle/puzzleLevels.ts

修改：
  src/game/Stats.ts                    （新增 shotsFired / levelId / parShots）
  src/game/systems/LevelSystem.ts      （puzzle 模式分支、清場判定）
  src/game/systems/CannonSystem.ts     （shotsFired 累計，可選 queue 支援）
  src/game/systems/HudSystem.ts        （puzzle 步數顯示）
  src/screens/ResultScreen.ts          （puzzle 評分區塊）
  src/screens/ModeSelectionScreen.ts   （puzzle 說明文案）
  src/game/Game.ts                     （監聽清場 signal、傳遞 puzzle 結果）
```
