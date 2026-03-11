# 程式碼風格規範

> **適用任務**: 程式碼審查、撰寫新程式碼、修正 lint 錯誤

---

## TypeScript 規則（`tsconfig.json`）

- **strict 模式**：禁止隱式 `any`
- `noUnusedLocals`：禁止未使用的區域變數
- `noUnusedParameters`：禁止未使用的函式參數
- `noImplicitReturns`：所有分支都必須明確回傳
- target: `ESNext`，module: `ESNext`

---

## 命名慣例

| 對象 | 規則 | 範例 |
|------|------|------|
| 私有欄位 | 底線前綴 | `_hitArea`, `_type` |
| 公開 getter/setter | 無底線 | `get x()`, `set type()` |
| 系統識別碼 | 靜態常數 | `static readonly SYSTEM_ID = 'aim-system'` |
| 畫面識別碼 | 靜態常數 | `static readonly SCREEN_ID = 'game-screen'` |
| 型別/介面 | PascalCase | `BubbleType`, `AppScreen` |
| 常數（模組層級） | UPPER_SNAKE_CASE | `MAX_BUBBLES_PER_LINE` |

---

## 格式化（Prettier，`.prettierrc`）

```json
{
  "tabWidth": 4,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120
}
```

---

## ESLint（`.eslintrc.json`）

- 基礎：`eslint:recommended` + `@typescript-eslint/recommended`
- Import 排序：`simple-import-sort`（自動排列，無需手動維護）
- 允許明確的 `any` 型別（但應盡量避免）

**常用指令**：
```bash
npm run lint        # 檢查
npm run lint:fix    # 自動修正（包含 import 排序）
npm run format      # Prettier 格式化
```

---

## Import 風格

自動排序，執行 `lint:fix` 即可。手動撰寫時依此順序：
1. 第三方套件（`pixi.js`, `gsap`, `typed-signals`）
2. 專案內部模組（相對路徑）

```typescript
// ✅ 正確
import gsap from 'gsap';
import { Container } from 'pixi.js';

import { boardConfig } from '../boardConfig';
import { Bubble } from '../entities/Bubble';

// ❌ 避免混排
import { boardConfig } from '../boardConfig';
import { Container } from 'pixi.js';
```

---

## 類別結構慣例

```typescript
export class MySystem implements System {
    // 1. 靜態常數
    public static readonly SYSTEM_ID = 'my-system';

    // 2. 公開屬性
    public game!: Game;
    public someSignal = new Signal<() => void>();

    // 3. 私有屬性（底線前綴）
    private _container!: Container;
    private _isActive = false;

    // 4. 建構子（若需要）
    constructor() { ... }

    // 5. 生命週期方法（依 init/awake/start/update/end/reset/resize 順序）
    public init() { ... }
    public update(delta: number) { ... }

    // 6. 公開方法
    public doSomething() { ... }

    // 7. 私有方法
    private _helper() { ... }

    // 8. Getter / Setter
    public get value() { return this._value; }
    public set value(v: number) { this._value = v; }
}
```
