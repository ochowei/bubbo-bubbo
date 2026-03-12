# Bubbo Bubbo

Welcome to the Bubbo Bubbo open source game! This project was created to help developers learn how a professional makes games using the PixiJS library. The goal of this project is to provide a comprehensive guide and example of game development in PixiJS.

This project utilises multiple pixi based libraries including;
- [PixiJS](https://github.com/pixijs/pixijs) a rendering library built for the web.
- [Sound](https://github.com/pixijs/sound) a WebAudio API playback library, with filters. 
- [UI](https://github.com/pixijs/ui) for ease creation of commonly used UI components in PixiJS.
- [AssetPack](https://github.com/pixijs/assetpack) that optimises assets for the web!

# Features
- Simple, yet comprehensive example of a PixiJS game,
- Clear and concise code explanations,
- Includes essential game development concepts such as stat management, systems, game loops, and user input etc.
- Designed to be easily understandable and expandable for further learning and development

# Controls

## Default: Pointer / Touch
The cannon is aimed and fired using standard pointer events (`pointermove` + `pointertap`), which work transparently on both **desktop** (mouse) and **mobile** (touchscreen) via PixiJS's unified event system. No extra configuration is required.

## Virtual Joystick (Extension Guide)
The project does not include a virtual joystick out of the box, but it is a straightforward extension that demonstrates key PixiJS patterns — overlaying a UI control, reading its delta as an angle, and feeding the result into the existing `CannonSystem`.

### How to add it

**1. Create a `VirtualJoystick` entity** (`src/game/entities/VirtualJoystick.ts`)

The joystick consists of a static base ring and a movable knob. Track touch/pointer events on the base to compute the knob's offset, then clamp it to a maximum radius:

```typescript
import { Container, Sprite } from 'pixi.js';

export class VirtualJoystick {
    public view = new Container();
    /** Normalised direction (-1 … +1) the knob is currently pushed toward */
    public deltaX = 0;
    public deltaY = 0;

    private readonly _knob: Sprite;
    private readonly _maxRadius = 50;

    constructor() {
        const base = Sprite.from('joystick-base');   // add your asset
        base.anchor.set(0.5);
        this.view.addChild(base);

        this._knob = Sprite.from('joystick-knob');   // add your asset
        this._knob.anchor.set(0.5);
        this.view.addChild(this._knob);
    }

    /**
     * Update the knob position from a pointer offset.
     * @param dx - Raw horizontal delta from the joystick origin.
     * @param dy - Raw vertical delta from the joystick origin.
     */
    public update(dx: number, dy: number) {
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const clamped = Math.min(len, this._maxRadius);

        this._knob.x = (dx / len) * clamped;
        this._knob.y = (dy / len) * clamped;

        this.deltaX = this._knob.x / this._maxRadius;  // -1 … +1
        this.deltaY = this._knob.y / this._maxRadius;
    }

    /** Snap the knob back to centre when the finger is lifted. */
    public reset() {
        this._knob.x = 0;
        this._knob.y = 0;
        this.deltaX = 0;
        this.deltaY = 0;
    }
}
```

**2. Create a `JoystickSystem`** (`src/game/systems/JoystickSystem.ts`)

The system listens to pointer events on the game's hit area, drives `VirtualJoystick`, and translates its output into a cannon angle that `CannonSystem` can consume:

```typescript
import { type FederatedPointerEvent, Container } from 'pixi.js';

import type { Game } from '../Game';
import type { System } from '../SystemRunner';
import { VirtualJoystick } from '../entities/VirtualJoystick';
import { CannonSystem } from './CannonSystem';
import { HudSystem } from './HudSystem';
import { LevelSystem } from './LevelSystem';

export class JoystickSystem implements System {
    public static SYSTEM_ID = 'joystick';
    public game!: Game;
    public view = new Container();

    private readonly _joystick = new VirtualJoystick();
    /** Screen-space origin captured when the finger first touches down */
    private _originX = 0;
    private _originY = 0;
    private _active = false;

    public init() {
        // Attach the joystick visual to the HUD
        this.game.systems.get(HudSystem).view.addChild(this.view);
        this.view.addChild(this._joystick.view);

        // Position in the lower-left corner (adjust to taste)
        this._joystick.view.x = -150;
        this._joystick.view.y = -80;

        this.game.systems.get(LevelSystem).signals.onGameReady.connect(() => {
            const hit = this.game.hitContainer;
            hit.on('pointerdown',  this._onDown.bind(this));
            hit.on('pointermove',  this._onMove.bind(this));
            hit.on('pointerup',    this._onUp.bind(this));
            hit.on('pointerupoutside', this._onUp.bind(this));
        });
    }

    public reset() {
        this._active = false;
        this._joystick.reset();
    }

    private _onDown(e: FederatedPointerEvent) {
        this._active = true;
        this._originX = e.global.x;
        this._originY = e.global.y;
    }

    private _onMove(e: FederatedPointerEvent) {
        if (!this._active) return;

        const dx = e.global.x - this._originX;
        const dy = e.global.y - this._originY;

        this._joystick.update(dx, dy);

        // Convert joystick delta to an angle and push it to the cannon
        const angle = Math.atan2(this._joystick.deltaY, this._joystick.deltaX);
        this.game.systems.get(CannonSystem).setAngle(angle);
    }

    private _onUp() {
        this._active = false;
        this._joystick.reset();
    }
}
```

**3. Expose `setAngle` on `CannonSystem`**

Add a small public helper so `JoystickSystem` (or any other input source) can drive the cannon without duplicating the rotation logic:

```typescript
// Inside CannonSystem
public setAngle(angle: number) {
    this._aimAngle = angle;
    this.cannon.rotation = angle + Math.PI * 0.5;
    this._cannonForward.set(
        80 * Math.cos(angle) + this.cannonX,
        80 * Math.sin(angle) + this.cannonY,
    );
}
```

**4. Register the system in `Game.ts`**

```typescript
// src/game/Game.ts  →  init()
import { JoystickSystem } from './systems/JoystickSystem';

this.systems.add(JoystickSystem);
```

The system is now live. Because all input paths funnel through `CannonSystem.setAngle`, the aim line from `AimSystem` updates automatically — no further changes needed.

> **Asset note**: add your joystick sprites to `raw-assets/` and run `npm run assets` to regenerate the asset bundles before testing.

# Prerequisites
To run this project, you need to have `Node.js` and `npm` installed on your system.

# Setup and run the game
```sh
# Clone the repository
# git clone <your-repository-url>

# Clone the repository
cd ./bubbo-bubbo

# Install dependencies
npm install

# Start the project
npm run start
```

# Building the game
```sh
# Compile the game into a bundle, which can be found in `dist/`
npm run build
```
# Known issues
- Asset bundles aren't currently watched, so any assets being added or removed would mean you have to run `npm run build-assets` again
- It may take a while for vite to launch the game on localhost

# Open Source Figma Design
### View the Figma file [here](https://www.figma.com/file/XhYGrHOi4txWYHjfG1n4lj/Bubbo-Bubbo?node-id=0%3A1)

In addition to making the code for this game open source, we are also making the Figma design file used to create the game available to the community. It contains all the design elements, assets, and layouts used in the game.

By making the file open source, we hope to provide an even more comprehensive learning experience for developers. You can use this as a reference for your own design projects or to see how a professional designs games.

> Please note that the design file is only available as a read-only version. This means you can view and inspect the file, but you cannot make changes or use any of the assets for your own projects.

# Usage
Feel free to use this project as a reference for your own game development. Use the code comments to understand how the game works and experiment by making changes to the code to see how it affects the game. This project is designed to be a starting point for your own learning and development journey with PixiJS.

# Contributions
We encourage you to fork the repository and improve the game in any way you see fit. Share your improvements with the community by submitting pull requests to the original repository.

# License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## GSAP

This game uses GSAP for its animations. You can use the free version of GSAP for some commercial projects. However please check the licensing options from [GreenSock](https://greensock.com/licensing/).

---
> Author [@AshsHub](https://github.com/AshsHub)