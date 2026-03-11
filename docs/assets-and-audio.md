# 資產與音效

> **適用任務**: 新增音效、新增圖片資源、管理資產 bundle、處理載入問題

---

## 資產管線

```
raw-assets/          ← 放置原始素材（PNG、WAV 等）
    ↓  npm run assets（AssetPack 處理）
public/assets/       ← 自動產生，勿手動修改
src/manifest.json    ← 自動產生的 bundle 清單
```

**Bundle 定義**在 `.assetpack.js`，每個畫面對應一個 bundle（如 `game-screen`、`title-screen`）。

---

## 在畫面中宣告資產

```typescript
export class GameScreen extends Container implements AppScreen {
    // 宣告後，navigation 在顯示此畫面前會自動載入
    public static readonly assetBundles = ['game-screen'];
}
```

手動載入（若非透過 navigation）：
```typescript
import { Assets } from 'pixi.js';
await Assets.loadBundle('game-screen');
```

判斷 bundle 是否已載入：
```typescript
import { areBundlesLoaded } from './assets';
if (!areBundlesLoaded(['game-screen'])) { ... }
```

---

## 音效 API（`src/audio.ts`）

**三個 singleton**：

| Singleton | 用途 |
|-----------|------|
| `sfx` | 音效（短音效，可多個同時播放）|
| `bgm` | 背景音樂（同時只有一首）|
| `audio` | 主音量控制（靜音/音量）|

```typescript
import { sfx, bgm, audio } from '../audio';

// 播放音效
sfx.play('audio/bubble-pop-sfx.wav');
sfx.play('audio/bubble-land-sfx.wav', { speed: 0.9 }); // speed 改變音調

// 背景音樂
bgm.play('audio/bgm.wav', { loop: true });
bgm.stop();

// 靜音控制
audio.muted = true;
audio.muted = false;
```

**已知音效檔路徑**（位於 `public/assets/audio/`）：
- `audio/bubble-pop-sfx.wav` — 泡泡消除音
- `audio/bubble-land-sfx.wav` — 泡泡落地音
- `audio/cannon-sfx.wav` — 發射音
- `audio/bgm.wav` — 背景音樂

---

## 靜音狀態持久化

靜音設定存於 localStorage，透過 `storage` singleton 存取：

```typescript
import { storage } from './storage';

storage.set('muted', true);           // 儲存
const muted = storage.get('muted');   // 讀取（boolean）
```

**storage 支援的 key**：
- `'muted'`：boolean
- `'highscore'`：number
