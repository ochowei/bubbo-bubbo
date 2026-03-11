# Bubbo Bubbo — Claude Code 索引

泡泡射擊遊戲，以 PixiJS v8 + TypeScript 建構的教育性開源專案。

**Tech stack**: PixiJS v8 · GSAP v3 · typed-signals · Vite · AssetPack

---

## 開發指令

```bash
npm run start        # 開發模式（hot reload）
npm run build        # 正式建構
npm run lint:fix     # 自動修正 lint + import 排序
npm run format       # Prettier 格式化
npm run assets       # 處理原始資產（AssetPack）
npm run types        # TypeScript 型別檢查
```

---

## 專案結構

```
src/
├── main.ts                  # 入口：初始化 PixiJS App
├── navigation.ts            # 全域 singleton：畫面導航
├── assets.ts / audio.ts / storage.ts  # 全域服務
├── game/
│   ├── Game.ts              # 遊戲主類別，管理所有系統
│   ├── SystemRunner.ts      # 系統生命週期管理
│   ├── boardConfig.ts       # 遊戲數值設定（唯一真相來源）
│   ├── designConfig.ts      # UI 尺寸設定（428×925 基準）
│   ├── Pool.ts              # 物件池 singleton
│   ├── Stats.ts             # 玩家統計（分數、連擊等）
│   ├── entities/            # Bubble, Cannon, PhysicsBody...
│   └── systems/             # 10 個遊戲系統（各司其職）
│       ├── AimSystem        # 瞄準線
│       ├── CannonSystem     # 大砲
│       ├── PhysicsSystem    # 物理 + 碰撞
│       ├── LevelSystem      # 關卡 + 格子管理
│       ├── ScoreSystem      # 分數
│       ├── PowerSystem      # 特殊泡泡效果
│       ├── HudSystem        # HUD UI
│       ├── EffectsSystem    # 特效
│       ├── PauseSystem      # 暫停
│       └── SpaceDecorSystem # 背景裝飾
├── screens/                 # TitleScreen, GameScreen, ResultScreen...
└── ui/                      # 按鈕、HUD 元件等
```

---

## 全域 Singleton 速查

| Singleton | 來源 | 用途 |
|-----------|------|------|
| `navigation` | `src/navigation.ts` | 畫面切換 |
| `pool` | `src/game/Pool.ts` | 物件池 |
| `audio` / `bgm` / `sfx` | `src/audio.ts` | 音效控制 |
| `storage` | `src/storage.ts` | localStorage |
| `app` | `src/main.ts` | PixiJS Application |

---

## 依任務選擇文件

| 任務類型 | 閱讀文件 |
|---------|---------|
| 新增遊戲系統 | [`docs/architecture.md`](docs/architecture.md) |
| 新增畫面或覆蓋層 | [`docs/architecture.md`](docs/architecture.md) |
| 調整遊戲數值/難度 | [`docs/game-mechanics.md`](docs/game-mechanics.md) |
| 處理泡泡類型/物理/座標 | [`docs/game-mechanics.md`](docs/game-mechanics.md) |
| 新增音效或資產 | [`docs/assets-and-audio.md`](docs/assets-and-audio.md) |
| 修正 lint / 程式碼審查 | [`docs/code-style.md`](docs/code-style.md) |

---

## 關鍵規則（必讀）

1. **`public/` 目錄禁止手動修改**，由 `npm run assets` 自動產生。
2. **新增系統**後必須在 `Game.ts` 的 `init()` 呼叫 `this.systems.add(NewSystem)`。
3. **`SYSTEM_ID`** 與 **`SCREEN_ID`** 必須全域唯一。
4. **座標原點在畫面底部中央**，Y 軸向上為負。
5. **泡泡實例必須透過物件池**：`pool.get(Bubble)` / `pool.return(bubble)`。
6. **UI 位置以 `designConfig.content`（428×925）為基準**，勿用硬編碼像素值。
