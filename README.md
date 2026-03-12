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

# Controls

## Current Input Method

The game uses PixiJS's unified pointer event system, which handles both mouse and touch input transparently:

| Event | Action |
|-------|--------|
| Move pointer / drag finger | Aim the cannon |
| Click / tap | Fire a bubble |

The `AimSystem` listens to `pointermove` to update the trajectory preview, while `CannonSystem` listens to `pointertap` to fire. Because PixiJS normalises mouse and touch into the same `FederatedPointerEvent`, the game already works on touchscreen devices out of the box.

## Virtual Joystick (Extension Idea)

A **virtual joystick** is a common mobile UI pattern where an on-screen thumbstick replaces raw pointer-position input. Instead of tapping anywhere to aim, the player drags a joystick thumb from a fixed base, and the drag direction/magnitude drives the cannon angle.

### Why it is a good fit for this project

- The game canvas is designed at **428 × 925 px** (portrait phone), so screen real-estate for a thumb-zone is plentiful at the bottom.
- Dragging a joystick avoids the problem of the player's finger **obscuring the aim line** when tapping near the cannon.
- Implementing one is an excellent exercise in **combining PixiJS UI components with the existing System architecture** — a perfect next step after reading the codebase.

### How to implement it

A virtual joystick would integrate cleanly as a new system (`JoystickSystem`) or as an extension of `CannonSystem`:

1. **Render the joystick** — create a base `Sprite` and a thumb `Sprite`, position them in the lower-left area of `HudSystem`'s view.
2. **Track drag input** — listen to `pointerdown` / `pointermove` / `pointerup` on the base container; clamp the thumb offset to the joystick radius.
3. **Convert offset to angle** — `Math.atan2(thumbOffsetY, thumbOffsetX)` produces the same radian angle that `CannonSystem._calculateAngle()` already uses.
4. **Drive the cannon** — call `cannonSystem.setAngle(angle)` (a small public method you expose) instead of deriving the angle from the global pointer position.
5. **Fire on release or via a separate button** — a dedicated "Fire" button alongside the joystick gives cleaner one-handed play.

```
┌──────────────────────────────┐
│        [ bubble grid ]       │
│                              │
│         [ cannon ]           │
│                              │
│  ◉ joystick      [ FIRE ]    │  ← bottom control zone
└──────────────────────────────┘
```

Because the game logic only cares about the *angle* fed into the cannon, swapping or layering input methods requires no changes to `PhysicsSystem`, `AimSystem`'s trajectory calculation, or `LevelSystem`. This loose coupling is intentional and is a good example of the **System pattern** described in [`docs/architecture.md`](docs/architecture.md).

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