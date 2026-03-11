# 遊戲機制

> **適用任務**: 調整遊戲數值、新增泡泡類型、修改物理行為、處理碰撞/座標問題

---

## 設定檔

### `src/game/boardConfig.ts` — 遊戲板（單一真相來源）

| 欄位 | 值 | 說明 |
|------|----|------|
| `bubblesPerLine` | 13 | 每行泡泡數 |
| `bubbleSize` | 428/13 ≈ 32.9px | 泡泡尺寸（依畫面寬度自動計算） |
| `bounceLine` | 145 | 遊戲結束線（Y 座標，底部往上） |
| `scoreIncrement` | 10 | 每顆泡泡基礎分數 |
| `startingLines` | 10 | 初始行數 |
| `specialBubbleEvery` | 3 | 每幾行出現一次特殊泡泡 |
| `specialBubbleChance` | 0.01 | 特殊泡泡出現機率（1%）|
| `newLine.animInTime` | 3s | 新行推入動畫時間 |
| `newLine.urgentMinLines` | 8 | 剩餘幾行觸發緊急模式 |
| `newLine.animInDecrement` | 0.05 | 每次新行加速量 |
| `power.blastRadius` | 2 | 炸彈爆炸半徑（格數）|
| `power.timerFreezeTime` | 5s | 計時器泡泡凍結時間 |

### `src/game/designConfig.ts` — UI 設計

| 欄位 | 值 | 說明 |
|------|----|------|
| `content.width` | 428 | 設計稿基準寬度 |
| `content.height` | 925 | 設計稿基準高度 |
| `debugBody` | false | 設為 `true` 可顯示碰撞體（除錯用）|
| `decorCountDesktop` | 6 | 桌面背景裝飾數量 |
| `decorCountMobile` | 3 | 行動裝置背景裝飾數量 |

---

## 泡泡類型

```typescript
// 一般泡泡（RegularBubbleType）
'yellow' | 'green' | 'red' | 'blue'

// 特殊泡泡（SpecialBubbleType）
'bomb'   // 爆炸半徑 2 格
'super'  // 消除整行
'timer'  // 凍結新行 5 秒
```

**工具函式**（來自 `boardConfig.ts`）：
```typescript
import { isSpecialType, randomType } from '../boardConfig';

isSpecialType(bubble.type);  // boolean — 判斷是否為特殊泡泡
randomType();                 // 隨機一般泡泡
randomType('special');        // 隨機特殊泡泡
randomType('all');            // 隨機任意泡泡
```

---

## 物理系統（PhysicsBody）

`src/game/entities/PhysicsBody.ts`

**三種狀態**（`PhysicsState`）：

| 狀態 | 說明 | 適用情境 |
|------|------|---------|
| `STATIC` | 靜止，不受物理影響 | 泡泡位於格子上 |
| `DYNAMIC` | 受重力影響 | 泡泡從格子掉落 |
| `KINEMATIC` | 由速度驅動，忽略重力 | 泡泡被射出後飛行 |

**物理常數**：
- 重力：`9.8 * (1/60)` 單位/幀²
- 阻尼：`0.6`（反彈時速度衰減）
- 碰撞判斷：兩泡泡中心距離 < 半徑和的 90%

**泡泡物理操作**：
```typescript
bubble.body.state = PhysicsState.KINEMATIC;
bubble.body.velocity.set(vx, vy);  // 設定初速度
bubble.body.applyForce(fx, fy);    // 施加衝力（用於掉落）
```

---

## 座標系統

**重要**：遊戲容器錨定於**畫面底部中央**。

```
畫面頂部  ← y = -designConfig.content.height（約 -925）
    ↑
    |  （泡泡格位於負 Y 區域）
    |
原點(0,0) ← 畫面底部中央
```

- **X 軸**：向右為正，`-width/2` 到 `+width/2`
- **Y 軸**：向上為負（往畫面頂部走 Y 值越小）

**格子座標 → 世界座標**：
```typescript
// i = 欄（0~12），j = 列（從底部往上計數）
worldX = (i + 1) * (boardConfig.bubbleSize / 2)
worldY = -j * boardConfig.bubbleSize
```

**Resize 時的錨定**（`Game.ts`）：
```typescript
this.gameContainer.x = w * 0.5;  // 水平置中
this.gameContainer.y = h;         // 錨定底部
```

---

## 泡泡生命週期

```
pool.get(Bubble)
  → bubble.reset()          // 重置 UID、物理狀態、位置
  → bubble.type = 'red'     // 設定類型（同步更新視覺）
  → bubble.connect(i, j)    // 放置到格子（state → STATIC）
  → bubble.drop()           // 從格子掉落（state → DYNAMIC）
  → pool.return(bubble)     // 歸還物件池
```
