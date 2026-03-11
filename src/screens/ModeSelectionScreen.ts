import gsap from 'gsap';
import { Container, Text, Texture, TilingSprite } from 'pixi.js';

import { designConfig } from '../game/designConfig';
import type { AppScreen } from '../navigation';
import { navigation } from '../navigation';
import { SecondaryButton } from '../ui/buttons/SecondaryButton';
import { i18n } from '../utils/i18n';
import { GameScreen } from './GameScreen';

/** The game modes available for selection. */
export type GameMode = 'endless' | 'time-attack' | 'puzzle';

/** Shared text style for mode description labels. */
const DESC_STYLE = {
    fontSize: 16,
    fontFamily: 'Opensans-Semibold',
    fill: 0x555555,
    align: 'center' as const,
    lineHeight: 22,
} as const;

/** The screen that lets the player choose a game mode before playing. */
export class ModeSelectionScreen extends Container implements AppScreen {
    /** A unique identifier for the screen */
    public static SCREEN_ID = 'mode-selection';
    /**
     * 'title-screen' supplies the background tile and font assets.
     * 'game-screen' supplies the button-flat sprite used by SecondaryButton.
     */
    public static assetBundles = ['title-screen', 'game-screen'];

    private readonly _background: TilingSprite;
    private readonly _title: Text;
    private readonly _endlessBtn: SecondaryButton;
    private readonly _endlessDesc: Text;
    private readonly _timeAttackBtn: SecondaryButton;
    private readonly _timeAttackDesc: Text;
    private readonly _puzzleBtn: SecondaryButton;
    private readonly _puzzleDesc: Text;

    /** Container animated in from the top */
    private readonly _topAnimContainer = new Container();
    /** Container animated in from the bottom */
    private readonly _bottomAnimContainer = new Container();

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

        // Title — black text is clearly readable on the light dotted background
        this._title = new Text({
            text: i18n.t('modeSelectTitle'),
            style: {
                fontSize: 58,
                fontFamily: 'Bungee-Regular',
                fill: 0x000000,
                align: 'center',
            },
        });
        this._title.anchor.set(0.5);
        this._topAnimContainer.addChild(this._title);

        // Endless
        this._endlessBtn = new SecondaryButton({ text: i18n.t('modeEndless'), tint: 0x49c8ff });
        this._endlessBtn.onPress.connect(() => {
            navigation.goToScreen(GameScreen, { mode: 'endless' as GameMode });
        });
        this._endlessDesc = new Text({ text: i18n.t('modeEndlessDesc'), style: DESC_STYLE });
        this._endlessDesc.anchor.set(0.5, 0);

        // Time Attack
        this._timeAttackBtn = new SecondaryButton({ text: i18n.t('modeTimeAttack'), tint: 0xffca42 });
        this._timeAttackBtn.onPress.connect(() => {
            navigation.goToScreen(GameScreen, { mode: 'time-attack' as GameMode });
        });
        this._timeAttackDesc = new Text({ text: i18n.t('modeTimeAttackDesc'), style: DESC_STYLE });
        this._timeAttackDesc.anchor.set(0.5, 0);

        // Puzzle
        this._puzzleBtn = new SecondaryButton({ text: i18n.t('modePuzzle'), tint: 0xff5f5f });
        this._puzzleBtn.onPress.connect(() => {
            navigation.goToScreen(GameScreen, { mode: 'puzzle' as GameMode });
        });
        this._puzzleDesc = new Text({ text: i18n.t('modePuzzleDesc'), style: DESC_STYLE });
        this._puzzleDesc.anchor.set(0.5, 0);

        this._bottomAnimContainer.addChild(
            this._endlessBtn,
            this._endlessDesc,
            this._timeAttackBtn,
            this._timeAttackDesc,
            this._puzzleBtn,
            this._puzzleDesc,
        );

        this.addChild(this._topAnimContainer, this._bottomAnimContainer);
    }

    /** Called before `show`, resets animation containers to off-screen positions. */
    public prepare() {
        gsap.set(this._topAnimContainer, { y: -300 });
        gsap.set(this._bottomAnimContainer, { y: 400 });
    }

    /** Called when the screen is being shown. */
    public async show() {
        gsap.killTweensOf(this);
        this.alpha = 0;

        await gsap.to(this, { alpha: 1, duration: 0.2, ease: 'linear' });

        const slideIn = { y: 0, duration: 0.75, ease: 'elastic.out(1, 0.5)' };

        gsap.to(this._topAnimContainer, slideIn);
        gsap.to(this._bottomAnimContainer, slideIn);
    }

    /** Called when the screen is being hidden. */
    public async hide() {
        gsap.killTweensOf(this);
        await gsap.to(this, { alpha: 0, duration: 0.2, ease: 'linear' });
    }

    /**
     * Gets called every time the screen resizes.
     * @param w - width of the screen.
     * @param h - height of the screen.
     */
    public resize(w: number, h: number) {
        this._background.width = w;
        this._background.height = h;

        const cx = w * 0.5;

        this._title.x = cx;
        this._title.y = h * 0.18;

        // Each row = button (height ~52px at scale 0.75) + 8px gap + desc (~44px) + 20px gap
        const rowHeight = 124;
        const groupTop = h * 0.38;

        // Endless row
        this._endlessBtn.x = cx;
        this._endlessBtn.y = groupTop;
        this._endlessDesc.x = cx;
        this._endlessDesc.y = groupTop + 46;

        // Time Attack row
        this._timeAttackBtn.x = cx;
        this._timeAttackBtn.y = groupTop + rowHeight;
        this._timeAttackDesc.x = cx;
        this._timeAttackDesc.y = groupTop + rowHeight + 46;

        // Puzzle row
        this._puzzleBtn.x = cx;
        this._puzzleBtn.y = groupTop + rowHeight * 2;
        this._puzzleDesc.x = cx;
        this._puzzleDesc.y = groupTop + rowHeight * 2 + 46;
    }
}
