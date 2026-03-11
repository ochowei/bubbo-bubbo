# Bubbo Bubbo — Claude Code Guide

## 專案概述

Bubbo Bubbo 是一個以 **PixiJS** 建構的開源泡泡射擊遊戲，作為學習現代 Web 遊戲開發的教育資源。

- **語言**: TypeScript（strict 模式）
- **渲染引擎**: PixiJS v8
- **動畫**: GSAP v3
- **事件系統**: typed-signals
- **建構工具**: Vite
- **資產處理**: AssetPack

---

## 開發指令

```bash
npm run start          # 開發模式（Vite hot reload）
npm run build          # 正式建構
npm run preview        # 建構後本地預覽
npm run lint           # ESLint 檢查
npm run lint:fix       # 自動修正 lint 問題
npm run format         # Prettier 格式化
npm run format:check   # 檢查格式是否正確
npm run assets         # 處理原始資產（AssetPack）
npm run types          # TypeScript 型別檢查
npm run clean          # 清除建構產物
```

---

## 專案結構

```
src/
├── main.ts                  # 應用程式入口，初始化 PixiJS Application
├── navigation.ts            # 全域 singleton：螢幕導航管理器
├── assets.ts                # 資產載入與管理
├── audio.ts                 # 音效管理（BGM / SFX / 靜音）
├── storage.ts               # localStorage 存取（靜音設定、最高分）
├── game/
│   ├── Game.ts              # 遊戲主類別，管理所有系統
│   ├── Stats.ts             # 玩家統計資料（分數、連擊等）
│   ├── Pool.ts              # 物件池（防止 GC 暫停）
│   ├── SystemRunner.ts      # 系統生命週期管理器
│   ├── boardConfig.ts       # 遊戲板設定（泡泡尺寸、類型、分數等）
│   ├── designConfig.ts      # UI/設計設定（畫面尺寸、裝飾數量等）
│   ├── entities/            # 遊戲物件
│   │   ├── Bubble.ts        # 泡泡實體（含物理、視覺）
│   │   ├── BubbleView.ts    # 泡泡視覺呈現
│   │   ├── BubbleLine.ts    # 一列泡泡的集合
│   │   ├── BubbleReserve.ts # 大砲備用泡泡
│   │   ├── Cannon.ts        # 大砲實體
│   │   └── PhysicsBody.ts   # 輕量物理模擬
│   └── systems/             # 遊戲系統（各司其職）
│       ├── AimSystem.ts     # 瞄準線軌跡視覺化
│       ├── CannonSystem.ts  # 大砲旋轉與發射
│       ├── EffectsSystem.ts # 粒子特效與動畫
│       ├── HudSystem.ts     # HUD UI 更新
│       ├── LevelSystem.ts   # 關卡產生、泡泡格管理
│       ├── PauseSystem.ts   # 暫停/繼續邏輯
│       ├── PhysicsSystem.ts # 物理移動與碰撞偵測
│       ├── PowerSystem.ts   # 特殊泡泡效果
│       ├── ScoreSystem.ts   # 分數計算與最高分
│       └── SpaceDecorSystem.ts # 背景裝飾動畫
├── screens/
│   ├── GameScreen.ts        # 遊戲主畫面
│   ├── LoadScreen.ts        # 載入畫面
│   ├── ModeSelectionScreen.ts # 模式選擇（無盡/限時）
│   ├── ResultScreen.ts      # 結果畫面
│   ├── TitleScreen.ts       # 標題畫面
│   └── overlays/
│       └── PauseOverlay.ts  # 暫停覆蓋層
├── ui/                      # UI 元件
│   ├── buttons/             # 各種按鈕元件
│   └── ...                  # 其他 UI 元件
└── utils/
    ├── maths/
    │   ├── Vector2.ts       # 完整 2D 向量類別
    │   ├── maths.ts         # 數學工具函式
    │   ├── rand.ts          # 隨機數工具
    │   └── time.ts          # 時間工具
    ├── i18n.ts              # 國際化
    ├── device.ts            # 裝置偵測（行動/桌面）
    ├── throttle.ts          # 節流函式
    └── utils.ts             # 通用工具
```

---

## 核心架構模式

### 1. 系統架構（System Pattern）

遊戲邏輯分散於 10 個獨立系統，透過 `SystemRunner` 統一管理。

**系統生命週期**（依序呼叫）：
```
init()   → 初始化一次，設定容器、訊號連接
awake()  → 每次遊戲開始前呼叫
start()  → 開始遊戲邏輯、啟用輸入
update() → 每幀呼叫（傳入 delta time）
end()    → 遊戲結束時呼叫
reset()  → 清除狀態以準備下一局
resize() → 視窗尺寸改變時呼叫
```

**新增系統的模板**：
```typescript
import type { System } from '../SystemRunner';
import type { Game } from '../Game';

export class MySystem implements System {
    public static readonly SYSTEM_ID = 'my-system'; // 必須唯一

    public game!: Game; // 由 SystemRunner 自動注入

    public init() { /* 只執行一次的初始化 */ }
    public awake() { /* 每局遊戲開始前 */ }
    public start() { /* 遊戲開始 */ }
    public update(delta: number) { /* 每幀 */ }
    public end() { /* 遊戲結束 */ }
    public reset() { /* 重置狀態 */ }
    public resize(w: number, h: number) { /* 視窗調整 */ }
}
```

在 `Game.ts` 的 `init()` 中用 `this.systems.add(MySystem)` 註冊。

### 2. 螢幕/導航系統（Navigation Pattern）

使用全域 `navigation` singleton 管理畫面切換。

**螢幕介面**（實作 `AppScreen`）：
```typescript
import type { AppScreen } from '../navigation';

export class MyScreen extends Container implements AppScreen {
    public static readonly SCREEN_ID = 'my-screen'; // 必須唯一
    public static readonly assetBundles = ['my-bundle']; // 需要的資產包

    public prepare(data?: MyData) { /* 接收導航傳遞的資料 */ }
    public async show() { /* 顯示動畫 */ }
    public async hide() { /* 隱藏動畫 */ }
    public update(time: Ticker) { /* 每幀更新 */ }
    public resize(w: number, h: number) { /* 視窗調整 */ }
}
```

**導航方式**：
```typescript
// 切換到新畫面（舊畫面會被隱藏）
navigation.goToScreen(ResultScreen, { score: 100 });

// 顯示覆蓋層（疊加在現有畫面上）
navigation.showOverlay(PauseOverlay);

// 隱藏覆蓋層
navigation.hideOverlay();
```

### 3. 物件池（Object Pool）

避免遊戲中頻繁垃圾回收，使用 `pool` singleton 管理泡泡實例。

```typescript
import { pool } from '../Pool';

// 取得一個泡泡實例（複用或新建）
const bubble = pool.get(Bubble);

// 歸還實例供下次使用
pool.return(bubble);
```

### 4. 訊號系統（Signal Pattern）

系統間透過 `typed-signals` 解耦通訊。

```typescript
import { Signal } from 'typed-signals';

// 定義訊號（通常在 System 內）
public onSomethingHappened = new Signal<(data: MyData) => void>();

// 發送訊號
this.onSomethingHappened.emit(data);

// 在其他系統中訂閱
this.game.systems.get(MySystem).onSomethingHappened.connect((data) => {
    // 處理事件
});
```

---

## 關鍵設定檔

### `boardConfig.ts` — 遊戲板設定
遊戲數值的單一真相來源，修改這裡即可調整難度與行為：
- `bubblesPerLine`: 每行泡泡數（13）
- `bubbleSize`: 泡泡尺寸（依畫面寬度自動計算）
- `bounceLine`: 遊戲結束線（145）
- `scoreIncrement`: 每顆泡泡分數（10）
- `specialBubbleChance`: 特殊泡泡出現機率（0.01 = 1%）
- `newLine.animInTime`: 新行動畫時間（3 秒）
- `power.blastRadius`: 炸彈爆炸半徑（2）

### `designConfig.ts` — UI 設計設定
- `content.width / height`: 設計稿基準尺寸（428 × 925）
- `debugBody`: 設為 `true` 可顯示物理碰撞體（除錯用）
- `decorCountDesktop / decorCountMobile`: 背景裝飾數量

---

## 泡泡類型

**一般泡泡**（`RegularBubbleType`）：
- `'yellow'`、`'green'`、`'red'`、`'blue'`

**特殊泡泡**（`SpecialBubbleType`）：
- `'bomb'`：炸彈（爆炸半徑 2 格）
- `'super'`：超級泡泡（消除整行）
- `'timer'`：計時器（凍結新行出現 5 秒）

**型別判斷**：
```typescript
import { isSpecialType, randomType } from '../boardConfig';

isSpecialType(bubble.type); // boolean
randomType('regular');      // 隨機一般泡泡
randomType('special');      // 隨機特殊泡泡
randomType('all');           // 隨機任意泡泡
```

---

## 物理體（PhysicsBody）

泡泡有三種物理狀態（`PhysicsState`）：
- `STATIC`：靜止在格子上，不受物理影響
- `DYNAMIC`：受重力影響（泡泡掉落時）
- `KINEMATIC`：由速度驅動（發射中的泡泡）

重力常數：`9.8 * (1/60)`，阻尼係數：`0.6`。

---

## 座標系統

- **原點**: 遊戲容器錨定於畫面**底部中央**
- **Y 軸**: 向上為負（泡泡格位於負 Y 區域）
- **格子座標**: `(i, j)` — `i` 為欄（0~12），`j` 為列（從底部往上計數）
- **格子轉世界座標**:
  ```typescript
  x = (i + 1) * (boardConfig.bubbleSize / 2)
  y = -j * boardConfig.bubbleSize
  ```

---

## 程式碼風格規範

### TypeScript
- 使用 **strict 模式**，禁止隱式 `any`
- 禁止未使用的區域變數與參數（`noUnusedLocals`, `noUnusedParameters`）
- 禁止隱式回傳（`noImplicitReturns`）

### 命名慣例
- **私有欄位**: 底線前綴（`_hitArea`, `_type`）
- **公開 getter/setter**: 不加底線（`get x()`, `set type()`）
- **系統識別碼**: 靜態 `SYSTEM_ID` 字串常數
- **畫面識別碼**: 靜態 `SCREEN_ID` 字串常數

### 格式化（Prettier）
```json
{
  "tabWidth": 4,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120
}
```

### Import 順序
使用 `simple-import-sort` 外掛自動排序，執行 `npm run lint:fix` 自動修正。

---

## 音效管理

```typescript
import { sfx, bgm, audio } from '../audio';

// 播放音效
sfx.play('audio/bubble-pop-sfx.wav');
sfx.play('audio/bubble-pop-sfx.wav', { speed: 0.9 }); // 調整音調

// 背景音樂
bgm.play('audio/bgm.wav', { loop: true });

// 主音量控制
audio.muted = true;
```

---

## 資產管理

資產透過 AssetPack 處理，存放於 `public/assets/`，並在 `src/manifest.json` 中定義 bundle。

**在畫面中宣告所需資產**：
```typescript
export class GameScreen extends Container implements AppScreen {
    public static readonly assetBundles = ['game-screen'];
    // navigation 會在顯示此畫面前自動載入對應 bundle
}
```

**手動載入資產**：
```typescript
import { Assets } from 'pixi.js';
await Assets.loadBundle('game-screen');
```

---

## 全域 Singleton 列表

| Singleton | 來源 | 用途 |
|-----------|------|------|
| `navigation` | `src/navigation.ts` | 畫面/覆蓋層導航 |
| `pool` | `src/game/Pool.ts` | 物件池管理 |
| `audio` | `src/audio.ts` | 主音量控制 |
| `bgm` | `src/audio.ts` | 背景音樂 |
| `sfx` | `src/audio.ts` | 音效 |
| `storage` | `src/storage.ts` | localStorage |
| `app` | `src/main.ts` | PixiJS Application |

---

## 常見模式範例

### 取得其他系統
```typescript
// 在系統的方法中，透過 this.game 存取其他系統
const levelSystem = this.game.systems.get(LevelSystem);
const pauseSystem = this.game.systems.get(PauseSystem);
```

### 在遊戲容器中新增視覺元素
```typescript
// 在系統的 init() 中
this.myView = new Container();
this.game.addToGame(this.myView);

// 移除
this.game.removeFromGame(this.myView);
```

### 使用 GSAP 動畫（需配合暫停系統）
```typescript
import gsap from 'gsap';

// 基本補間
gsap.to(this.view, { alpha: 0, duration: 0.3 });

// 等待動畫完成
await gsap.to(this.view, { y: 100, duration: 0.5 }).then();

// 延遲呼叫
gsap.delayedCall(1, () => { /* 1秒後執行 */ });
```

### 使用 Vector2 工具
```typescript
import { Vector2 } from '../utils/maths/Vector2';

const dir = new Vector2(1, 0).rotate(Math.PI / 4).normalize();
const dist = Vector2.distance(posA, posB);
```

---

## 注意事項

1. **不要直接修改 `public/` 目錄**，其內容由 `npm run assets` 自動產生。
2. **新增系統後**，務必在 `Game.ts` 的 `init()` 方法中呼叫 `this.systems.add(NewSystem)`，否則系統不會被初始化。
3. **每個系統必須有唯一的 `SYSTEM_ID`**，每個畫面必須有唯一的 `SCREEN_ID`。
4. **座標原點在畫面底部中央**，新增視覺元素時請記得 Y 軸方向。
5. **使用物件池**複用泡泡實例（`pool.get(Bubble)` / `pool.return(bubble)`），避免記憶體洩漏。
6. **`designConfig.content`** 定義設計稿的基準解析度（428×925），所有 UI 位置應基於此計算，並適應不同螢幕尺寸。
