# 架構模式

> **適用任務**: 新增遊戲系統、新增畫面/覆蓋層、理解整體架構

---

## System Pattern（遊戲系統）

遊戲邏輯分散於 10 個獨立系統，透過 `SystemRunner` 統一管理。所有系統存放於 `src/game/systems/`。

**生命週期**（依序呼叫）：

| 方法 | 時機 | 呼叫次數 |
|------|------|---------|
| `init()` | 系統加入時 | 一次 |
| `awake()` | 每局開始前 | 每局 |
| `start()` | 遊戲啟動 | 每局 |
| `update(delta)` | 每幀 | 多次 |
| `end()` | 遊戲結束 | 每局 |
| `reset()` | 重置狀態 | 每局 |
| `resize(w, h)` | 視窗調整 | 不定 |

**新增系統模板**：
```typescript
// src/game/systems/MySystem.ts
import type { System } from '../SystemRunner';
import type { Game } from '../Game';

export class MySystem implements System {
    public static readonly SYSTEM_ID = 'my-system'; // 必須全域唯一

    public game!: Game; // 由 SystemRunner 自動注入

    public init() { /* 設定容器、連接 Signal */ }
    public awake() { /* 每局開始前的準備 */ }
    public start() { /* 啟用輸入、開始邏輯 */ }
    public update(delta: number) { /* 每幀邏輯 */ }
    public end() { /* 移除監聽器 */ }
    public reset() { /* 清除狀態 */ }
    public resize(w: number, h: number) { /* 重新定位元素 */ }
}
```

**在 `Game.ts` 的 `init()` 中註冊**（順序即執行順序）：
```typescript
this.systems.add(MySystem); // 加在 init() 裡
```

**在系統中存取其他系統**：
```typescript
const level = this.game.systems.get(LevelSystem);
const pause = this.game.systems.get(PauseSystem);
```

**在系統中操作遊戲容器**：
```typescript
// init() 內
this.myView = new Container();
this.game.addToGame(this.myView);   // 加入遊戲畫面
this.game.removeFromGame(this.myView); // 移除
```

---

## Navigation Pattern（畫面導航）

使用全域 `navigation` singleton，畫面存放於 `src/screens/`。

**AppScreen 介面**：
```typescript
// src/screens/MyScreen.ts
import { Container } from 'pixi.js';
import type { AppScreen } from '../navigation';

export class MyScreen extends Container implements AppScreen {
    public static readonly SCREEN_ID = 'my-screen'; // 必須全域唯一
    public static readonly assetBundles = ['my-bundle']; // 宣告所需資產包

    public prepare(data?: MyData) { /* 接收導航傳入的資料 */ }
    public async show() { /* 顯示動畫，await 完成後才繼續 */ }
    public async hide() { /* 隱藏動畫 */ }
    public update(time: Ticker) { /* 每幀更新 */ }
    public resize(w: number, h: number) { /* 視窗調整 */ }
}
```

**導航 API**：
```typescript
import { navigation } from '../navigation';

navigation.goToScreen(ResultScreen, { score: 100 }); // 切換畫面（舊畫面被隱藏）
navigation.showOverlay(PauseOverlay);                 // 疊加覆蓋層
navigation.hideOverlay();                             // 隱藏覆蓋層
```

- 畫面實例會被快取，相同畫面第二次顯示不會重新建立
- `assetBundles` 未載入時，`navigation` 會自動顯示 LoadScreen

---

## Signal Pattern（系統間通訊）

系統間不直接互相呼叫，改用 `typed-signals` 解耦。

```typescript
import { Signal } from 'typed-signals';

// 定義（在發送方系統）
public onBubblePopped = new Signal<(bubble: Bubble) => void>();

// 發送
this.onBubblePopped.emit(bubble);

// 訂閱（在接收方系統的 init() 內）
this.game.systems.get(PhysicsSystem).onBubblePopped.connect((bubble) => {
    // 處理事件
});
```

---

## Object Pool（物件池）

避免遊戲中頻繁 GC，所有泡泡實例都透過 `pool` 管理。

```typescript
import { pool } from '../Pool';

const bubble = pool.get(Bubble);    // 取得（複用或新建）
pool.return(bubble);                 // 歸還
```

池化的物件必須實作 `reset()` 方法，每次 `pool.get()` 前會自動呼叫。
