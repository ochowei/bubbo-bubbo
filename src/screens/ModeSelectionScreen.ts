import gsap from 'gsap';
import { Container, Graphics, Text, Texture, TilingSprite } from 'pixi.js';

import { designConfig } from '../game/designConfig';
import type { AppScreen } from '../navigation';
import { navigation } from '../navigation';
import { SecondaryButton } from '../ui/buttons/SecondaryButton';
import { i18n } from '../utils/i18n';
import { GameScreen } from './GameScreen';

/** The game modes available for selection. */
export type GameMode = 'endless' | 'time-attack' | 'puzzle';

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
    /** Coloured pill behind the title text for legibility */
    private readonly _titleBadge: Graphics;
    private readonly _title: Text;
    private readonly _endlessBtn: SecondaryButton;
    private readonly _timeAttackBtn: SecondaryButton;
    private readonly _puzzleBtn: SecondaryButton;

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

        // Rounded pill behind the title so it stands out on any background
        this._titleBadge = new Graphics();
        this._topAnimContainer.addChild(this._titleBadge);

        this._title = new Text({
            text: i18n.t('modeSelectTitle'),
            style: {
                fontSize: 60,
                fontFamily: 'Bungee-Regular',
                fill: 0xffffff,
                align: 'center',
            },
        });
        this._title.anchor.set(0.5);
        this._topAnimContainer.addChild(this._title);

        this._endlessBtn = new SecondaryButton({
            text: i18n.t('modeEndless'),
            tint: 0x49c8ff,
        });
        this._endlessBtn.onPress.connect(() => {
            navigation.goToScreen(GameScreen, { mode: 'endless' as GameMode });
        });

        this._timeAttackBtn = new SecondaryButton({
            text: i18n.t('modeTimeAttack'),
            tint: 0xffca42,
        });
        this._timeAttackBtn.onPress.connect(() => {
            navigation.goToScreen(GameScreen, { mode: 'time-attack' as GameMode });
        });

        this._puzzleBtn = new SecondaryButton({
            text: i18n.t('modePuzzle'),
            tint: 0xff5f5f,
        });
        this._puzzleBtn.onPress.connect(() => {
            navigation.goToScreen(GameScreen, { mode: 'puzzle' as GameMode });
        });

        this._bottomAnimContainer.addChild(this._endlessBtn, this._timeAttackBtn, this._puzzleBtn);

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
        const titleY = h * 0.28;

        // Redraw the badge to fit behind the title text
        const badgeW = 360;
        const badgeH = 80;

        this._titleBadge
            .clear()
            .roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 16)
            .fill({ color: 0x000000, alpha: 0.45 });
        this._titleBadge.x = cx;
        this._titleBadge.y = titleY;

        this._title.x = cx;
        this._title.y = titleY;

        const btnSpacing = 90;
        const baseY = h * 0.56;

        this._endlessBtn.x = cx;
        this._endlessBtn.y = baseY;

        this._timeAttackBtn.x = cx;
        this._timeAttackBtn.y = baseY + btnSpacing;

        this._puzzleBtn.x = cx;
        this._puzzleBtn.y = baseY + btnSpacing * 2;
    }
}
