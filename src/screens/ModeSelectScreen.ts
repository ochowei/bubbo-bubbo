import gsap from 'gsap';
import { Container, Text, Texture, TilingSprite } from 'pixi.js';

import { designConfig } from '../game/designConfig';
import type { AppScreen } from '../navigation';
import { navigation } from '../navigation';
import { SecondaryButton } from '../ui/buttons/SecondaryButton';
import { GameScreen } from './GameScreen';

const MODES = ['Endless', 'Time Attack', 'Puzzle'] as const;

type GameMode = (typeof MODES)[number];

/** A screen that allows players to choose a game mode before starting. */
export class ModeSelectScreen extends Container implements AppScreen {
    /** A unique identifier for the screen */
    public static SCREEN_ID = 'mode-select';
    /** An array of bundle IDs for dynamic asset loading. */
    public static assetBundles = ['title-screen', 'game-screen'];

    private readonly _background: TilingSprite;
    private readonly _title: Text;
    private readonly _buttons: SecondaryButton[] = [];

    constructor() {
        super();

        this._background = new TilingSprite({
            texture: Texture.from('background-tile'),
            width: 64,
            height: 64,
            tileScale: {
                x: designConfig.backgroundTileScale,
                y: designConfig.backgroundTileScale,
            },
        });
        this.addChild(this._background);

        this._title = new Text({
            text: 'Select Mode',
            style: {
                fill: 0xffffff,
                fontFamily: 'Bungee-Regular',
                fontSize: 56,
                align: 'center',
                stroke: {
                    color: 0x000000,
                    width: 6,
                },
            },
        });
        this._title.anchor.set(0.5);
        this.addChild(this._title);

        for (const mode of MODES) {
            const button = new SecondaryButton({
                text: mode,
                textStyle: {
                    fontSize: 30,
                },
            });

            button.onPress.connect(() => {
                navigation.goToScreen(GameScreen, { mode });
            });

            this._buttons.push(button);
            this.addChild(button);
        }
    }

    public async show() {
        gsap.killTweensOf(this);
        this.alpha = 0;
        await gsap.to(this, { alpha: 1, duration: 0.2, ease: 'linear' });
    }

    public async hide() {
        gsap.killTweensOf(this);
        await gsap.to(this, { alpha: 0, duration: 0.2, ease: 'linear' });
    }

    public resize(w: number, h: number) {
        this._background.width = w;
        this._background.height = h;

        this._title.x = w * 0.5;
        this._title.y = h * 0.28;

        const startY = h * 0.45;
        const gap = 90;

        this._buttons.forEach((button, index) => {
            button.x = w * 0.5;
            button.y = startY + gap * index;
        });
    }
}

export type { GameMode };
